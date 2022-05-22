import path from 'path';
import fs from 'fs';

import { RunningChildProcess } from './running-child-process';

export function setupStdioRedirection(
  engineProcess: RunningChildProcess,
  engineName,
  options: { logger?; logPath?: string } = {}
) {
  if (options.logger) {
    const logger = options.logger;
    logger.registerDataStream(engineProcess.stdout, engineProcess.stderr);
  } else if (options.logPath) {
    const logFile = path.join(options.logPath, `${engineName}.log`);
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });
    console.log('[info] engine logFile: ', logFile);
    // log engine output
    engineProcess.stdout.pipe(logStream);
    engineProcess.stderr.pipe(logStream);
  } else {
    console.warn('[warning] no logging setup for engine run');
  }
}
