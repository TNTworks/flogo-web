import { promisify } from 'util';
import fs from 'fs';

const readDir = promisify(fs.readdir);

export function getFileNames(dirPath) {
  return readDir(dirPath);
}
