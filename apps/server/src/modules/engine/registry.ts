import { ContributionType, __DEV_RESOURCE_REF_PLACEHOLDER } from '@flogo-web/core';
import { Engine } from './engine';
import { logger, engineLogger } from '../../common/logging';
import { config } from '../../config/app-config';
import { ContribInstallController } from '../contrib-install-controller';
import { installResourceTypes } from './install-resource-types';
import { EngineProcessDirector } from './process/engine-process-director';

const CONTRIB_INSTALLER = 'contribInstaller';
const engineRegistry: { [key: string]: any } = {};
let defaultResourceTypes: string[] = [];

export function setDefaultResourceTypes(resourceTypes: string[]) {
  defaultResourceTypes = [...resourceTypes].filter(
    ref => ref !== __DEV_RESOURCE_REF_PLACEHOLDER
  );
}

/**
 * Gets initialized engine
 * @param enginePath {string} name/path of the engine
 * @param opts {object}
 * @param opts.forceCreate {boolean} default false
 * @returns {*}
 */
export async function getInitializedEngine(
  enginePath,
  opts: {
    forceCreate?: boolean;
    syncImportsOnCreation?: boolean;
    noLib?: boolean;
    libVersion?: string;
    useEngineConfig?: boolean;
  } = {}
): Promise<Engine> {
  if (engineRegistry[enginePath] && !opts.forceCreate) {
    return engineRegistry[enginePath];
  }

  let libVersion;
  if (opts.noLib) {
    libVersion = null;
  } else {
    libVersion = opts.libVersion || config.libVersion;
  }
  const engine = new Engine(enginePath, libVersion, engineLogger);
  engineRegistry[enginePath] = engine;

  const initTimer = logger.startTimer();
  const engineExists = await engine.exists();
  const isNewEngine = !engineExists || opts.forceCreate;
  await initEngine(engine, opts);
  if (isNewEngine && opts.syncImportsOnCreation) {
    await engine.build({ syncImports: true });
  }
  initTimer.done('EngineInit');

  return engine;
}

// todo: this should be done through constructor injection
// no need for a contrib installation controller registry
/**
 * Gets initialized ContributionInstallController instance and setup the controller's Engine and
 * RemoteInstaller instances which are used for installing a contribution
 * @param enginePath {string} name/path of the engine
 * @param installContribution {Function}
 * @returns {*} Instance of  ContribInstallController
 */
export function getContribInstallationController(
  enginePath,
  installContribution,
  engineProcessDirector: EngineProcessDirector
) {
  return getInitializedEngine(enginePath).then(engine => {
    if (!engineRegistry[CONTRIB_INSTALLER]) {
      engineRegistry[CONTRIB_INSTALLER] = new ContribInstallController();
    }
    return engineRegistry[CONTRIB_INSTALLER].setupController(
      engine,
      installContribution,
      engineProcessDirector
    );
  });
}

/**
 * Create engine in the local engines folder with the application json provided through defaultFlogoDescriptorPath
 *
 * @param engine {Engine} the engine details
 * @param opts {object} options required while creating the engine
 * @param opts.defaultFlogoDescriptorPath {string} Path to the application descriptor
 * @param opts.useContribBundle {boolean} Whether to install the default contributions
 * @param opts.useEngineConfig {boolean} Whether to copy default engine configuration file to the engine's root folder
 * @returns {boolean | Error}
 */
async function createEngine(
  engine,
  opts: {
    defaultFlogoDescriptorPath: string;
    useContribBundle: boolean;
    useEngineConfig: boolean;
  }
) {
  logger.warn('Engine does not exist. Creating...');
  const { defaultFlogoDescriptorPath, useContribBundle, useEngineConfig } = opts;
  try {
    await engine.create(defaultFlogoDescriptorPath);
    if (useContribBundle) {
      const contribBundlePath = config.defaultEngine.defaultContribBundle;
      logger.info(`Will install contrib bundle at ${contribBundlePath}`);
      await installResourceTypes(engine, defaultResourceTypes);
      await engine.installContribBundle(contribBundlePath);
    }
    if (useEngineConfig) {
      await engine.updateEngineConfig(config.defaultFlogoEngineConfigPath);
    }
  } catch (e) {
    logger.error('Found error while initializing engine:');
    logger.error(e);
    throw e;
  }
  return true;
}

/**
 *
 * @param engine {Engine}
 * @param options
 * @param options.skipBundleInstall {boolean} whether to install a contributions bundle or not
 * @param options.forceCreate {boolean} whether to create an engine irrespective of it's existence
 * @param options.defaultFlogoDescriptorPath {string} path to the default flogo application JSON
 * @param options.skipContribLoad {boolean} whether to refresh the list of contributions installed in the engine
 * @param options.useEngineConfig {boolean} whether to copy the engine configuration file to the flogo application folder
 * @returns {*}
 */
export function initEngine(engine, options) {
  const forceInit = options && options.forceCreate;
  const defaultFlogoDescriptorPath =
    (options && options.defaultFlogoDescriptorPath) || config.defaultFlogoDescriptorPath;
  const skipContribLoad = options && options.skipContribLoad;
  const skipBundleInstall = options && options.skipBundleInstall;
  const useEngineConfig = options && options.useEngineConfig;

  return engine
    .exists()
    .then(engineExists => {
      if (engineExists && forceInit) {
        return engine.remove().then(() => true);
      }
      return !engineExists || forceInit;
    })
    .then(shouldCreateNewEngine => {
      if (shouldCreateNewEngine) {
        return createEngine(engine, {
          defaultFlogoDescriptorPath,
          useContribBundle: !skipBundleInstall,
          useEngineConfig,
        });
      }
      return true;
    })
    .then(() => {
      if (skipContribLoad) {
        return true;
      }
      return engine.load().then(installedContribs => {
        const mapContribs = collection => collection.map(c => ({ ref: c.ref }));
        logger.info('installedContributions', {
          triggers: mapContribs(
            installedContribs.filter(
              contrib => contrib.rt.type === ContributionType.Trigger
            )
          ),
          activities: mapContribs(
            installedContribs.filter(
              contrib => contrib.rt.type === ContributionType.Activity
            )
          ),
          functions: mapContribs(
            installedContribs.filter(
              contrib => contrib.rt.type === ContributionType.Function
            )
          ),
        });
      });
    });
}
