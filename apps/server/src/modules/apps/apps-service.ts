import { inject, injectable } from 'inversify';
import { escapeRegExp, pick } from 'lodash';
import { Collection } from 'lokijs';
import shortid from 'shortid';

import { App, CONTRIB_REFS } from '@flogo-web/core';

import { EXPORT_MODE } from '../../common/constants';

import { normalizeName } from '../transfer/export/utils/normalize-name';
import { AppImporter } from './app-importer';
import { AppExporter, ExportAppOptions } from './app-exporter';

import { ErrorManager, ERROR_TYPES as GENERAL_ERROR_TYPES } from '../../common/errors';
import { Logger } from '../../common/logging';
import { CONSTRAINTS } from '../../common/validation';
import { TOKENS } from '../../core';
import { ResourceService } from '../resources';
import { buildBinary, buildPlugin } from './build';

import { Validator } from './validator';
import { AppTriggersService } from './triggers';
import { constructApp } from '../../core/models/app';
import { saveNew } from './common';

const EDITABLE_FIELDS = ['name', 'version', 'description'];
const PUBLISH_FIELDS: Array<keyof App> = [
  'id',
  'name',
  'type',
  'version',
  'description',
  'properties',
  'version',
  'createdAt',
  'updatedAt',
  'triggers',
  'resources',
];

@injectable()
export class AppsService {
  constructor(
    @inject(TOKENS.AppsDb) private appsDb: Collection,
    @inject(TOKENS.Logger) private logger: Logger,
    private resourceService: ResourceService,
    private triggersService: AppTriggersService,
    private appImporter: AppImporter,
    private appExporter: AppExporter
  ) {}

  async create(app): Promise<App> {
    let inputData = app;
    const errors = Validator.validateSimpleApp(inputData);
    if (errors) {
      return Promise.reject(
        ErrorManager.createValidationError('Validation error', errors)
      );
    }
    inputData = constructApp(inputData, shortid.generate);
    let newApp = await saveNew(inputData, this.appsDb);
    newApp = cleanForOutput(newApp);
    return newApp;
  }

  async importApp(app) {
    const appToSave = await this.appImporter.import(app);
    const savedApp = await saveNew(appToSave, this.appsDb);
    return this.findOne(savedApp.id);
  }

  /**
   *
   * @param appId if not provided will try to use app.id
   * @param newData {object}
   */
  async update(appId, newData) {
    const inputData = cleanInput(newData);
    const storedApp = this.appsDb.by('id', appId);

    if (!storedApp) {
      throw ErrorManager.makeError('App not found', {
        type: GENERAL_ERROR_TYPES.COMMON.NOT_FOUND,
      });
    }

    const appToValidate = { ...storedApp, ...inputData };
    const errors = Validator.validateSimpleApp(appToValidate);
    if (errors) {
      throw ErrorManager.createValidationError('Validation error', errors);
    }
    if (inputData.name) {
      appToValidate.name = appToValidate.name.trim();
      throwIfNameNotUnique(appToValidate.name, appId, this.appsDb);
    }
    this.appsDb.update({ ...storedApp, ...appToValidate });

    return this.findOne(appId, { withFlows: true });
  }

  /**
   * Delete an app.
   * Will also delete related flows
   * @param appId {string} appId
   */
  async remove(appId) {
    const appToRemove = await this.appsDb.by('id', appId);
    if (appToRemove) {
      this.appsDb.remove(appToRemove);
      await this.resourceService.removeFromRecentByAppId(appId);
    }
    return !!appToRemove;
  }

  /**
   * List or find all apps
   *
   * ## searchTerms
   * - name {string} find by name with exactly this name (case insensitive)
   *
   * ## options
   * - withFlows {boolean|string} get also all the related flows. Possible values:
   *    - short {string} - get short version of the flows
   *    - full {string} -  get full version of the flows
   *    - true {boolean} - same as 'short'
   *    - false {boolean} - do not get the flows
   *
   * @param terms
   * @param terms.name {string} name of the app
   * @param options
   * @param options.withFlows: retrieveFlows
   */
  async find(
    terms: { name?: string | RegExp } = {},
    { withFlows } = { withFlows: false }
  ) {
    const queryOptions: { [prop: string]: any } = {};
    if (terms.name) {
      const name = getAppNameForSearch(terms.name);
      queryOptions.name = { $regex: [`^${name}$`, 'i'] };
    }

    const result = this.appsDb.find(queryOptions);
    return result.map(cleanForOutput);
  }

  /**
   *
   * Options:
   *    * ## options
   *    - withFlows {boolean|string} get also all the related flows. Possible values:
   *      - short {string} - get short version of the flows
   *      - full {string} -  get full version of the flows
   *      - true {boolean} - same as 'short'
   *      - false {boolean} - do not get the flows
   * @param appId
   * @param options
   * @param options.withFlows retrieve flows
   */
  async findOne(
    appId,
    { withFlows }: { withFlows: string | boolean } = { withFlows: false }
  ) {
    const app = this.appsDb.by('id', appId);
    return app ? cleanForOutput(app) : null;
  }

  /**
   * Builds an app binary and returns the generated binary
   * @param appId {string} app to build
   * @param options
   * @param options.compile.os: target operating system
   * @param options.compile.arch: target architecture
   * @param options.shimTriggerId: create an app using shim mode using specified trigger id
   * @return {object} built app stream
   * @throws Not found error if app not found
   */
  async build(appId, options) {
    return buildBinary(() => this.export(appId), options);
  }

  /**
   * Builds an app in shim mode and returns the generated file
   * @param triggerId {string} trigger to build
   * @param options
   * @param options.compile.os: target operating system
   * @param options.compile.arch: target architecture
   * @param options.shimTriggerId: create an app using shim mode using specified trigger id
   * @return {{ trigger: string, appName: string, data: Stream }} built handler zip file
   * @throws Not found error if trigger not found
   */
  async buildShim(triggerId, options) {
    const trigger = await this.triggersService.findOne(triggerId);
    if (!trigger) {
      throw ErrorManager.makeError('Cannot build shim for unknown trigger id', {
        type: GENERAL_ERROR_TYPES.COMMON.NOT_FOUND,
      });
    }
    const build = trigger.ref === CONTRIB_REFS.LAMBDA ? buildPlugin : buildBinary;
    return build(() => this.export(trigger.appId), {
      ...options,
      shimTriggerId: normalizeName(trigger.name),
    });
  }

  /**
   * Export an app to the schema expected by cli
   * This will export apps and flows
   * @param {string} appId - app to export
   * @param {object} [options]
   * @param {string} [options.appModel] - type of export if it is an application export or a flows only export
   * @param {string} [options.format] - type of export if it is an application export or a flows only export
   * @param {string[]} [options.flowIds] - Array of flow Id's which are to be exported in case of flows only export
   * @return {object} exported object
   * @throws Not found error if app not found
   */
  async export(
    appId,
    { format, flowIds }: { appModel?: string; format?: string; flowIds?: string[] } = {}
  ) {
    const app = this.appsDb.by('id', appId);
    if (!app) {
      throw ErrorManager.makeError('Application not found', {
        type: GENERAL_ERROR_TYPES.COMMON.NOT_FOUND,
      });
    }

    const isFullExportMode = format !== EXPORT_MODE.FORMAT_FLOWS;
    const exportOptions: ExportAppOptions = {
      isFullExportMode,
      selectResources: flowIds,
    };
    return this.appExporter.export(app, exportOptions);
  }

  /**
   * Alias for AppsManager::find
   * @param args
   */
  list(...args) {
    return this.find(...args);
  }
}

function getAppNameForSearch(rawName) {
  return rawName ? escapeRegExp(rawName.trim().toLowerCase()) : undefined;
}

function cleanInput(app) {
  const cleanedApp = pick(app, EDITABLE_FIELDS);
  if (cleanedApp.name) {
    cleanedApp.name = cleanedApp.name.trim();
  }
  return cleanedApp;
}

function cleanForOutput(app) {
  return pick(app, PUBLISH_FIELDS);
}

function throwIfNameNotUnique(inputName, appId: string, appsDb: Collection) {
  const name = getAppNameForSearch(inputName);
  const [existing] = appsDb
    .chain()
    .find(
      {
        id: { $ne: appId },
        name: { $regex: [`^${name}$`, 'i'] },
      },
      true
    )
    .data();

  if (existing) {
    throw ErrorManager.createValidationError('Validation error', [
      {
        property: 'name',
        title: 'Name already exists',
        detail: "There's another app with that name",
        value: inputName,
        type: CONSTRAINTS.UNIQUE,
      },
    ]);
  }
}
