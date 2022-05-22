import * as path from 'path';
import { createLogger, transports, format, Logger } from 'winston';

import { config } from '../../config/app-config';
import { Stream } from 'stream';

export interface EngineLogger extends Logger {
  registerDataStream(stdout?: Stream, stderr?: Stream): void;
}

const engineLogger = createLogger({
  level: 'debug',
  format: format.combine(format.uncolorize(), format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: path.join(config.logsPath, 'engine.log') }),
  ],
}) as EngineLogger;
engineLogger.registerDataStream = registerDataStream;
export { engineLogger };

function registerDataStream(stdout, stderr) {
  if (stdout) {
    stdout.on('data', data => {
      splitByLineAndCleanColors(data).forEach(line => this.info(line));
    });
  }

  if (stderr) {
    stderr.on('data', data => {
      splitByLineAndCleanColors(data).forEach(line => {
        if (isDebug(line)) {
          this.info(line);
        } else {
          this.error(line);
        }
      });
    });
  }
}

function splitLines(str) {
  const lines = (str || '').match(/[^\r\n]+/g);
  return lines || [];
}

function isDebug(line) {
  return line.indexOf('▶ DEBUG') !== -1 || line.indexOf('▶ INFO');
}

function splitByLineAndCleanColors(data) {
  return splitLines(data.toString());
}
