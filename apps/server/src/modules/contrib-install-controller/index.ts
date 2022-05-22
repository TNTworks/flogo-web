import { EventEmitter } from 'events';
import * as path from 'path';

import { copyFile, fileExists, rmFolder } from '../../common/utils';
import { logger } from '../../common/logging';
import { ERROR_TYPES, ErrorManager } from '../../common/errors';
import { Engine, EngineProcessDirector } from '../engine';
import { syncTasks } from './sync-tasks';

export enum InstallEvents {
  StateChange = 'state-change',
}

export enum INSTALLATION_STATE {
  INIT = 'initializing',
  BACKUP = 'backing-up',
  INSTALL = 'installing-to',
  BUILD = 'building',
  COPYBIN = 'copying-binary',
  STOP = 'stopping',
  START = 'starting',
  SYNC = 'syncing-db',
}

const SRC_FOLDER = 'src';
const BACKUP_SRC_FOLDER = 'backupsrc';

export class ContribInstallController extends EventEmitter {
  private engine: Engine;
  private remoteInstaller;
  private engineProcessDirector: EngineProcessDirector;
  private _installState: INSTALLATION_STATE;

  constructor() {
    super();
  }

  get installState(): INSTALLATION_STATE {
    return this._installState;
  }

  // todo: all this should be injected in constructor
  setupController(
    engine: Engine,
    remoteInstaller,
    engineProcessDirector: EngineProcessDirector
  ) {
    this.engine = engine;
    this.remoteInstaller = remoteInstaller;
    this.updateInstallState(INSTALLATION_STATE.INIT);
    this.engineProcessDirector = engineProcessDirector;
    return this;
  }

  /**
   * Install the contribution accessible in a URL (github URL) to engine and restart the engine
   * @param url {string} URL path where the activity / trigger .json is located
   * @returns results {Object} results of installation
   * @returns results.success {array} array of successfully installed contribution urls
   * @returns results.fail {array} array of installation failed contribution urls
   */
  install(url) {
    let results = {};
    return this.installContribution(url)
      .then(installResults => {
        results = installResults;
        return this.buildEngine();
      })
      .then(() => {
        logger.debug(`Restarting the engine upon successful '${url}' installation.`);
        return this.restartEngineAfterBuild();
      })
      .then(() => this.updateContribsDB())
      .then(() => this.removeBackup())
      .then(() => results)
      .catch(err => {
        logger.error(
          `[error] Encountered error while installing the '${url}' to the engine: `
        );
        logger.error(err);
        logger.debug(`Installation of '${url}' failed in '${this._installState}' step.`);
        logger.debug(`Starting engine recovery.`);
        return this.recoverEngine()
          .then(() => this.removeBackup())
          .then(() => {
            throw this.buildErrorFromCurrentState();
          });
      });
  }

  installContribution(url) {
    return this.createBackup().then(() => this.installToEngine(url));
  }

  restartEngineAfterBuild() {
    return this.stopEngine()
      .then(() => this.copyBinary())
      .then(() => this.startEngine());
  }

  updateContribsDB() {
    logger.debug(`Syncing the contributions DB`);
    this.updateInstallState(INSTALLATION_STATE.SYNC);
    return this.engine.load().then(() => syncTasks(this.engine));
  }

  recoverEngine() {
    let promise = null;
    switch (this._installState) {
      case INSTALLATION_STATE.INSTALL:
        promise = this.recoverSource();
        break;
      case INSTALLATION_STATE.BUILD:
        promise = this.recoverSource().then(() => this.buildEngine());
        break;
      case INSTALLATION_STATE.COPYBIN:
        promise = this.recoverSource()
          .then(() => this.buildEngine())
          .then(() => this.copyBinary());
        break;
      case INSTALLATION_STATE.STOP:
      case INSTALLATION_STATE.START:
      case INSTALLATION_STATE.SYNC:
        promise = this.recoverSource()
          .then(() => this.buildEngine())
          .then(() => this.restartEngineAfterBuild());
        break;
      default:
        promise = Promise.resolve(true);
        break;
    }
    return promise;
  }

  createBackup() {
    logger.debug(`Backing up '${SRC_FOLDER}' to '${BACKUP_SRC_FOLDER}'.`);
    this.updateInstallState(INSTALLATION_STATE.BACKUP);
    let promise = null;
    const srcPath = path.join(this.engine.path, SRC_FOLDER);
    if (fileExists(srcPath)) {
      promise = copyFile(srcPath, path.join(this.engine.path, BACKUP_SRC_FOLDER));
    } else {
      promise = Promise.resolve(true);
    }
    return promise;
  }

  removeBackup() {
    logger.debug('Resource cleaning: removing the backup folder.');
    const pathToDel = path.join(this.engine.path, BACKUP_SRC_FOLDER);
    if (fileExists(pathToDel)) {
      rmFolder(pathToDel);
    }
  }

  recoverSource() {
    logger.debug('[Log] Recovering engine to previous working state..');
    let promise = null;
    const srcPath = path.join(this.engine.path, BACKUP_SRC_FOLDER);
    if (fileExists(srcPath)) {
      promise = copyFile(srcPath, path.join(this.engine.path, SRC_FOLDER));
    } else {
      promise = Promise.resolve(true);
    }
    return promise;
  }

  installToEngine(url) {
    logger.debug(`Started installing '${url}' to the engine.`);
    this.updateInstallState(INSTALLATION_STATE.INSTALL);
    return this.remoteInstaller(url, this.engine);
  }

  buildEngine() {
    logger.debug('Building engine.');
    this.updateInstallState(INSTALLATION_STATE.BUILD);
    return this.engine.buildOnly();
  }

  copyBinary() {
    logger.debug('Copying binary to bin folder.');
    this.updateInstallState(INSTALLATION_STATE.COPYBIN);
    return this.engine.copyToBinTest();
  }

  stopEngine() {
    logger.debug('Stopping enigne.');
    this.updateInstallState(INSTALLATION_STATE.STOP);
    return this.engineProcessDirector.kill();
  }

  startEngine() {
    logger.debug('Starting enigne.');
    this.updateInstallState(INSTALLATION_STATE.START);
    return Promise.resolve(true);
    // return this.engineProcess.start(this.engine.getProjectDetails());
  }

  private updateInstallState(state: INSTALLATION_STATE) {
    const prevState = this._installState;
    this.emit(InstallEvents.StateChange, { state: this._installState, prevState });
  }

  private buildErrorFromCurrentState() {
    let message = 'Installation failed ';
    let type = ERROR_TYPES.ENGINE.NOTHANDLED;
    switch (this._installState) {
      case INSTALLATION_STATE.BACKUP:
        message = message + `while taking backup of ${SRC_FOLDER}`;
        type = ERROR_TYPES.ENGINE.BACKUP;
        break;
      case INSTALLATION_STATE.INSTALL:
        message = message + 'while installing ';
        type = ERROR_TYPES.ENGINE.INSTALL;
        break;
      case INSTALLATION_STATE.BUILD:
        message = message + 'while building the engine';
        type = ERROR_TYPES.ENGINE.BUILD;
        break;
      case INSTALLATION_STATE.COPYBIN:
        message = message + 'while copying the binary';
        type = ERROR_TYPES.ENGINE.BUILD;
        break;
      case INSTALLATION_STATE.STOP:
        message = message + 'while stopping the engine';
        type = ERROR_TYPES.ENGINE.STOP;
        break;
      case INSTALLATION_STATE.START:
        message = message + 'while starting the engine';
        type = ERROR_TYPES.ENGINE.START;
        break;
      case INSTALLATION_STATE.SYNC:
        message = message + 'while syncing to database';
        type = ERROR_TYPES.ENGINE.SYNC;
        break;
      default:
        message = message + `at ${this._installState} state`;
        break;
    }
    return ErrorManager.createRestError(message, { type });
  }
}
