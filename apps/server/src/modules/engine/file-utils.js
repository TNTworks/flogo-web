import fse from 'fs-extra';
import { join as joinPath, parse as parsePath } from 'path';
import {
  asyncIsDirectory as isDirectory,
  changePermissions,
  copyFile,
  fileExists,
  rmFolder,
} from '../../common/utils/file';

export function removeDir(dirpath) {
  if (fileExists(dirpath)) {
    return rmFolder(dirpath);
  } else {
    return Promise.resolve(true);
  }
}

export async function findFirstChildDir(parentDirPath) {
  let files = await fse.readdir(parentDirPath);
  let currentFile;
  if (files.length <= 0) {
    throw new Error(`${parentDirPath} is empty`);
  }
  while (files.length > 0) {
    [currentFile, ...files] = files;
    const resultPath = joinPath(parentDirPath, currentFile);
    const isFileADirectory = await isDirectory(resultPath);
    if (isFileADirectory) {
      return resultPath;
    }
  }
  throw new Error(`No child directories found in ${parentDirPath}`);
}

export async function recursivelyFindFirstFile(dirPath) {
  const [childFile] = await fse.readdir(dirPath);
  if (!childFile) {
    throw new Error(`${dirPath} is empty`);
  }

  let resultPath = joinPath(dirPath, childFile);
  const isChildFileADirectory = await isDirectory(resultPath);
  if (isChildFileADirectory) {
    resultPath = await recursivelyFindFirstFile(resultPath);
  }
  return resultPath;
}

export function copyBinaryToDestination(enginePath, target) {
  return recursivelyFindFirstFile(joinPath(enginePath, 'bin')).then(binaryPath => {
    return copyBinaryToTarget(binaryPath, target);
  });
}

export function copyBinaryToTarget(binaryPath, targetDir) {
  const enginePathInfo = parsePath(binaryPath);
  const from = binaryPath;
  const to = joinPath(targetDir, enginePathInfo.base);

  const execPermissions = 0o755;
  return copyFile(from, to)
    .then(() => changePermissions(to, execPermissions))
    .then(() => ({ path: to }));
}
