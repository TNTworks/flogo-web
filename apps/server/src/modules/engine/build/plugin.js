import { join } from 'path';
import { build } from '../commander/build';
import { logger } from '../../../common/logging';

const HANDLER_FILE_NAME = 'handler.zip';

export function buildPlugin(enginePath, opts) {
  return build(enginePath, opts)
    .then(out => logger.debug(`[log] build output: ${out}`))
    .then(() => {
      // srcDir is </path/to/engine>/src/
      return { path: join(enginePath, 'src', HANDLER_FILE_NAME) };
    });
}
