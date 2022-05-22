import { readFile } from 'fs-extra';

import { logger } from '../../common/logging';
import { config } from './../../config/app-config';
import { getInitializedEngine, BuildOptions } from '../engine';

import { writeJSONFile } from '../../common/utils';

const defaultBuildOptions = (options: BuildOptions): BuildOptions => ({
  optimize: true,
  embedConfig: true,
  ...options,
});

export async function buildBinary(exportApp, options: BuildOptions) {
  return orchestrateBuild(exportApp, engine =>
    engine.build(defaultBuildOptions(options))
  );
}

/**
 * @param exportApp {Function}
 * @param options
 * @param options.shimTriggerId
 * @return {Promise<T>}
 */
export async function buildPlugin(
  exportApp,
  options: BuildOptions & { shimTriggerId: string }
) {
  return orchestrateBuild(exportApp, engine =>
    engine.buildPlugin(defaultBuildOptions(options))
  ).then(result => ({
    ...result,
    trigger: options.shimTriggerId,
    plugin: true,
  }));
}

export async function orchestrateBuild(exportApp, execBuildCommand) {
  const engineOptions = {
    forceCreate: true,
    // noLib: true,
    skipContribLoad: true,
    skipBundleInstall: true,
    defaultFlogoDescriptorPath: config.exportedAppBuild,
  };

  const timer = logger.startTimer();

  const exportedApp = await exportAppAndWriteToFileSystem(
    exportApp,
    engineOptions.defaultFlogoDescriptorPath
  );

  const createdEngine = await getInitializedEngine(config.appBuildEngine.path, {
    ...engineOptions,
  });
  const buildResult = await execBuildCommand(createdEngine);
  const binaryStream = await readFile(buildResult.path);

  await createdEngine.remove();
  timer.done(`done build`);
  return { appName: exportedApp.name, data: binaryStream };
}

async function exportAppAndWriteToFileSystem(exportApp, outputToPath) {
  const exportedApp = await exportApp();
  await writeJSONFile(outputToPath, exportedApp);
  return exportedApp;
}
