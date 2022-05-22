import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { config } from '../../config';
import { getFileNames } from './resources/get-file-names-in-dir';

export function fileUpload(router) {
  router.post('/upload/simulationData', handleFileUpload);
}

async function handleFileUpload(ctx) {
  const file = ctx.request.files;
  const fileName = Object.keys(file)[0];
  const filePath = file[fileName].path;
  const resourceId = ctx.request.body && ctx.request.body.resourceId;
  await delPrevFilesIfAny(fileName, resourceId);
  ctx.response.status = 200;
  ctx.body = {
    data: {
      filePath,
      fileName,
    },
  };
}

async function delPrevFilesIfAny(currentFileName, resourceId) {
  const uploadsDir = config.uploadsPath;
  const files = await getFileNames(uploadsDir);
  const filesToDel = files.filter(
    file => file.includes(resourceId) && file !== currentFileName
  );
  const deleteFile = promisify(fs.unlink);
  return Promise.all(
    filesToDel.map(fileToDel => {
      const filePathToDel = path.join(uploadsDir, fileToDel);
      return deleteFile(filePathToDel);
    })
  );
}
