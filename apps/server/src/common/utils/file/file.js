import fs from 'fs';
import fse from 'fs-extra';

import { isJSON } from '../json';

export function asyncIsDirectory(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  })
    .then(stats => stats.isDirectory())
    .catch(err => {
      if (err.code === 'ENOENT') {
        return Promise.resolve(false);
      }
      return Promise.reject(err);
    });
}

/**
 * Async version of readJSONFileSync
 * @param  {string|Path} jSONPath - the path of JSON file
 * @return {Promise<object|undefined>} if it is a valid and exist json, return json, otherwise return undefined
 */
export function readJSONFile(JSONPath) {
  return new Promise((resolve, reject) => {
    if (fileExists(JSONPath)) {
      fs.readFile(JSONPath, { encoding: 'utf8' }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(isJSON(data));
        }
      });
    } else {
      console.error(
        "[error][utils.js->readJSONFile] path doesn't exist. path: ",
        JSONPath
      );
      throw new Error(`Path [${JSONPath}] doesn't exist.`);
    }
  });
}

/**
 * Async version of writeJSONFileSync
 * @param {string|Path} JSONPath - the path of JSON file
 * @param {object} data - the JSON data you want to write
 * @return {Promise<boolean>} if write successful, return true, otherwise return false
 */
export function writeJSONFile(JSONPath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(JSONPath, JSON.stringify(data, null, 2), { encoding: 'utf8' }, err => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Create the given folder using `mkdir` command
 * @param folderPath
 * @returns {Promise}
 */
export function createFolder(folderPath) {
  return fse.ensureDir(folderPath);
}
export const ensureDir = createFolder;

/**
 * Remove the given folder using `rm -rf`
 * @param folderPath
 * @returns {Promise}
 */
export function rmFolder(folderPath) {
  return new Promise((resolve, reject) => {
    fse.remove(folderPath, err => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * TODO: async version?
 */
export function fileExists(testedPath) {
  try {
    fs.accessSync(testedPath, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

export function copyFile(source, target) {
  return new Promise((resolve, reject) => {
    fse.copy(source, target, error => {
      if (!error) {
        resolve();
      } else {
        reject(new Error(error));
      }
    });
  });
}

export function changePermissions(filePath, permissions) {
  return new Promise((resolve, reject) => {
    fs.chmod(filePath, permissions, err => {
      if (err) {
        reject(new Error(err));
      } else {
        resolve();
      }
    });
  });
}
