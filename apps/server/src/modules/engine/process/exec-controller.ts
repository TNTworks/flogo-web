import path from 'path';
import spawn from 'cross-spawn';

import { fileExists } from '../../../common/utils/file';
import { processHost } from '../../../common/utils/process';
import { RunningChildProcess } from './running-child-process';

const DEFAULT_ENV = {
  FLOGO_LOG_LEVEL: 'DEBUG',
};

export function execEngine(
  enginePath: string,
  engineName: string,
  // todo: add type
  options: {
    binDir?: string;
    env?: { [key: string]: any };
  } = {}
): RunningChildProcess {
  options = {
    binDir: 'bin',
    ...options,
  };
  console.log(`[info] starting engine ${engineName}`);

  const binPath = path.join(enginePath, options.binDir);
  console.log('[info] defaultEngineBinPath: ', binPath);

  if (!fileExists(path.join(binPath, engineName))) {
    const errorMessage = `[error] engine ${engineName} doesn't exist`;
    console.log(errorMessage);
    throw new Error(errorMessage);
  }

  const engineProcess = startProcess(engineName, binPath, options.env);

  let resolveClosed;
  engineProcess.whenClosed = new Promise(resolve => {
    resolveClosed = resolve;
  });
  engineProcess.on('exit', code => {
    engineProcess.closed = true;
    resolveClosed(code);
  });

  return engineProcess;
}

function startProcess(engineName: string, cwd: string, env: Record<string, string>) {
  const commandEnv = { ...process.env, ...DEFAULT_ENV, ...env };
  return spawn(getCommand(engineName), [], { cwd, env: commandEnv });
}

function getCommand(engineName: string) {
  if (processHost.isWindows()) {
    return engineName;
  }

  return `./${engineName}`;
}
