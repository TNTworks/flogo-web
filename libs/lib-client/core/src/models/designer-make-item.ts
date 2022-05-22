import { pick } from 'lodash';

import { ContributionSchema } from '@flogo-web/core';

import { TASK_TYPE } from '../constants';
import { flowToJSON_Task } from '../interfaces';

export function makeItem(source: flowToJSON_Task, schema: ContributionSchema) {
  return {
    ...getDefaultTaskProperties(schema),
    ...pick(source, ['id', 'name', 'description']),
    inputMappings: source.inputMappings || {},
    type: TASK_TYPE[source.type] ? TASK_TYPE[TASK_TYPE[source.type]] : TASK_TYPE.TASK,
    activitySettings: source.activitySettings || {},
  };
}

function getDefaultTaskProperties(schema: ContributionSchema) {
  return Object.assign({}, pick(schema, ['name', 'description', 'ref']));
}
