import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

import { config } from '../../../config';
import { getFileNames } from './get-file-names-in-dir';

export async function removeSimulateData(ctx) {
  const uploadsDir = config.uploadsPath;
  const resourceId = ctx.params && ctx.params.resourceId;
  const files = await getFileNames(uploadsDir);
  const fileName = files.find(file => file.includes(resourceId));
  const filePath = path.join(uploadsDir, fileName);
  await deleteFile(filePath);
  ctx.status = 204;
}

function deleteFile(filePath) {
  return promisify(fs.unlink)(filePath);
}
