import { join } from 'path';
import { mkdirSync } from 'fs';

import { config } from '../config/app-config';

const DIRS = [['engines'], ['db'], ['logs'], ['uploads']];

export function ensureDefaultDirsSync() {
  DIRS.forEach(d => mkdirSync(join(config.localPath, ...d), { recursive: true }));
}
