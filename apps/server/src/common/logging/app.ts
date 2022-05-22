import * as path from 'path';
import { createLogger, format, transports } from 'winston';

import { config } from '../../config/app-config';
import * as util from 'util';

const dimColor = text => `\x1b[2m${text}\x1b[0m`;
const logger = createLogger({
  level: config.logLevel,
  format: format.combine(
    format.colorize(),
    stringifyObjects('%O')(),
    format.timestamp({ format: 'HH:mm:ss.SSS' }),
    format(info => {
      const timestamp = `[${info.timestamp}]`;
      delete info.timestamp;
      info.message = `${dimColor(timestamp)} ${info.message}`;
      return info;
    })(),
    format.simple()
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(config.logsPath, 'app.log'),
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

export { logger };

function stringifyObjects(messageFormat: string) {
  return format(info => {
    const message = info.message as any;
    if (message instanceof Error) {
      info.message = Object.assign(
        {
          message: message.message,
          stack: message.stack,
        },
        info.message
      );
    }

    if (info instanceof Error) {
      info = Object.assign(
        {
          message: info.message,
          stack: info.stack,
        },
        info
      );
    }

    if (typeof info.message === 'object') {
      info.message = util.format(messageFormat, info.message);
    }

    return info;
  });
}
