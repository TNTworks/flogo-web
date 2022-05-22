import '../utils/crash-on-unhandled-rejection';
import { writeFileSync } from 'fs';
import { join as joinPath } from 'path';

import { Sources } from './config';

const version = getVersion();
console.log(`Updating version number to: ${version}`);
writeFileSync(
  joinPath(Sources.client, 'src', 'environments', 'version.ts'),
  `export const version = '${version}';\n`
);

function getVersion() {
  return process.env.FLOGO_LIB_VERSION || 'latest';
}
