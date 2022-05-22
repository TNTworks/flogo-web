import { fromPairs } from 'lodash';
import { Dictionary, makeItem as flogoMakeItem } from '@flogo-web/lib-client/core';
import { ContributionSchema } from '@flogo-web/core';

/* streams-plugin-todo: Add the streams backend interface */
export function makeStageItems(stages: any[], schemas: Dictionary<ContributionSchema>) {
  return fromPairs(stages.map(stage => [stage.id, makeItem(stage, schemas[stage.ref])]));
}

function makeItem(stage: any, schema: ContributionSchema) {
  return {
    ...flogoMakeItem(stage, schema),
    output: stage.output || {},
  };
}
