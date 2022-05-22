import * as fs from 'fs';
import { ContributionType } from '@flogo-web/core';

import { readJSONFile } from '../../common/utils/file';
import { normalizeContribSchema } from '../../common/contrib-schema-normalize';
import { ensureValidIcon } from './icon-resolver';
import { ListContributionDetails } from './commander';

function processSchemaWrapper(contribSchemaWrapper) {
  // rt === schema of the trigger
  contribSchemaWrapper.rt = normalizeContribSchema(contribSchemaWrapper.rt);
  return contribSchemaWrapper;
}

export const loader = {
  exists(enginePath) {
    return new Promise((resolve, reject) => {
      fs.stat(enginePath, (err, stats) => {
        if (err && err.code === 'ENOENT') {
          return resolve(false);
        } else if (err) {
          return reject(err);
        }
        if (stats.isFile() || stats.isDirectory()) {
          return resolve(true);
        }
      });
    });
  },
  async loadMetadata(contributions: ListContributionDetails[]) {
    const contributionsToRead = contributions.filter(
      contrib => contrib.type !== ContributionType.Action
    );
    const contributionSchemas = await _loadSchemas(contributionsToRead);
    return contributionSchemas.map(processSchemaWrapper);
  },
};

async function _loadSchemas(schemaInfos: ListContributionDetails[]) {
  if (!schemaInfos) {
    return [];
  }
  return Promise.all(schemaInfos.map(_loadSingleSchema));
}

async function _loadSingleSchema({ ref, path }: ListContributionDetails) {
  let schema = await readJSONFile(path);

  schema = await ensureValidIcon({
    contribSchema: schema,
    contribSchemaPath: path,
    contribSchemaRef: ref,
  });
  // rt means "runtime", the name was used to differentiate the ui descriptor versus the runtime descriptor,
  // now that the metadata is consolidated the "rt" qualifier is not necessary anymore but we need to change
  // other parts of the server code before changing it
  // todo: change "rt" to a more descriptive name
  return { path, ref, rt: { ...schema, ref } };
}
