import { inspect } from 'util';

import { DEFAULT_APP_TYPE, FLOGO_TASK_ATTRIBUTE_TYPE } from '../constants';
import { runShellCMD } from './process';

export * from './file';
export * from './json';
export * from './common';

export function atob(str) {
  return Buffer.from(str, 'base64').toString('binary');
}

/** *******
 * GitHub related utility functions
 */

// TODO support more git format
//  for the moment
//    https://github.com/:username/:projectname.git
//    https://github.com/:username/:projectname
const GITHUB_URL_PATTERN = /^(?:https\:\/\/)?github\.com\/(?:([\w\-]+)\/)(?:([\w\-]+)(?:\.git)?)$/
  .source;
const GITHUB_URL_SUBFOLDER_PATTERN = /^(?:https\:\/\/)?github\.com\/(?:([\w\-]+)\/)(?:([\w\-]+))\/(?:([\w\-/]+))$/
  .source;

export function parseGitHubURL(url) {
  const simplePattern = new RegExp(GITHUB_URL_PATTERN);
  const subfolderPattern = new RegExp(GITHUB_URL_SUBFOLDER_PATTERN);
  let result = null;

  let parsed = url.match(simplePattern);

  if (parsed) {
    result = {
      url: url,
      username: parsed[1],
      repoName: parsed[2],
    };
  } else {
    parsed = url.match(subfolderPattern);

    if (parsed) {
      result = {
        url: url,
        username: parsed[1],
        repoName: parsed[2],
        extraPath: parsed[3],
      };
    }
  }

  return result;
}

/** *******
 * CMD related utility functions
 */

/**
 * Git clone a given repo with `--recursive` flag, to an absolute path
 *
 * @param repoURL
 * @param folderPath
 * @returns {Promise}
 */
export function gitClone(repoURL, folderPath) {
  return new Promise((resolve, reject) => {
    runShellCMD('git', ['clone', '--recursive', repoURL, folderPath])
      .then(() => {
        resolve(true);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * Run `git pull --rebase` under the given absolute path.
 *
 * @param folderPath
 * @returns {Promise}
 */
export function gitUpdate(folderPath) {
  return new Promise((resolve, reject) => {
    runShellCMD('git', ['pull', '--rebase'], { cwd: folderPath })
      .then(() => {
        resolve(true);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/** *******
 * Logging related utilities
 */

/**
 * Inspect object using `util.inspect` of NodeJS
 * Mainly for debugging only, SHOULD NOT be used in production.
 *
 * @param obj
 */
export function inspectObj(obj) {
  console.log(inspect(obj, { depth: 7, colors: true }));
}

export function getDefaultValueByType(type) {
  const defaultValues = {
    [FLOGO_TASK_ATTRIBUTE_TYPE.STRING]: '',
    [FLOGO_TASK_ATTRIBUTE_TYPE.INTEGER]: 0,
    [FLOGO_TASK_ATTRIBUTE_TYPE.LONG]: 0,
    [FLOGO_TASK_ATTRIBUTE_TYPE.DOUBLE]: 0.0,
    [FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN]: false,
    [FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT]: null,
    [FLOGO_TASK_ATTRIBUTE_TYPE.ARRAY]: [],
    [FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS]: null,
    [FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS]: null,
    [FLOGO_TASK_ATTRIBUTE_TYPE.BYTES]: '',
  };

  if (!Object.hasOwnProperty.call(defaultValues, type)) {
    type = FLOGO_TASK_ATTRIBUTE_TYPE.STRING;
  }

  return defaultValues[type];
}

export function isValidApplicationType(appType) {
  return appType === DEFAULT_APP_TYPE;
}
