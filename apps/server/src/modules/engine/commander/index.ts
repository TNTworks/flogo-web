import { ContributionType } from '@flogo-web/core';
import { parseJSON } from '../../../common/utils';
import { logger } from '../../../common/logging';
import { runShellCMD } from '../../../common/utils/process';
import { build } from './build';

import * as path from 'path';

export interface ListContributionDetails {
  name: string;
  type: ContributionType;
  ref: string;
  path: string;
  descriptor: string;
}

export const commander = {
  /**
   *
   * @param enginePath
   * @param options
   * @param {string} [options.libVersion] - specify the flogo-lib version this is the same as flogo's flv option and
   * it will be passed as is
   * @param {string} [options.flogoDescriptor] - specify the flogo.json to create project from
   * @return {*}
   */
  create(enginePath, options) {
    options = options || {};
    const enginePathInfo = path.parse(enginePath);

    const command = ['create'];
    if (options.libVersion && options.libVersion !== 'latest') {
      command.push('--cv', options.libVersion);
    }

    if (options.flogoDescriptor) {
      command.push('-f', options.flogoDescriptor);
    }

    command.push(enginePathInfo.name);

    return _exec(enginePathInfo.dir, command);
  },
  build,
  add: {
    flow: install,
    contribBundle(enginePath, contribBundlePath, options) {
      options = Object.assign({}, options, { isContribBundle: true });
      return install(enginePath, contribBundlePath, options);
    },
    contribution: install,
  },
  install,
  update,
  list(enginePath) {
    return _exec(enginePath, ['list']).then(parseContributionList);
  },
};

function install(
  enginePath,
  contribPath,
  options?: {
    version?: string;
    isContribBundle?: boolean;
  }
) {
  options = options || {};
  const commandParams = ['install'];

  if (options.version && options.version !== 'latest') {
    commandParams.push('-v', options.version);
  }

  if (options.isContribBundle) {
    commandParams.push('--file', contribPath);
  } else {
    commandParams.push(contribPath);
  }

  return _exec(enginePath, commandParams);
}

function update(enginePath, contribNameOrPath) {
  return _exec(enginePath, ['update', contribNameOrPath]);
}

function parseContributionList(cmdResult: string): ListContributionDetails[] {
  return parseJSON(cmdResult).map((contrib: ListContributionDetails) => ({
    ...contrib,
    path: path.join(contrib.path, contrib.descriptor),
  }));
}

function _exec(enginePath, params) {
  logger.info(`Exec command: flogo ${params && params.join(' ')} in ${enginePath}`);
  return runShellCMD('flogo', params, { cwd: enginePath });
}
