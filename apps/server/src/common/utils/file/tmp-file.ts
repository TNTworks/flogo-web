import fs from 'fs';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { join } from 'path';
import { ensureDir } from './file';

const writeFile = promisify(fs.writeFile);
const removeFile = promisify(fs.unlink);

const APP_TMPDIR_NAME = 'flogoweb';

export function tmpFile(
  tmpName
): {
  path: string;
  write(data: string): Promise<void>;
  remove(): Promise<void>;
} {
  const flogoTmpDir = join(tmpdir(), APP_TMPDIR_NAME);
  const filePath = join(flogoTmpDir, tmpName);
  return {
    path: filePath,
    async write(content) {
      await ensureDir(flogoTmpDir);
      return writeFile(filePath, content);
    },
    remove: removeFile.bind(null, filePath),
  };
}
