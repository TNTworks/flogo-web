import { fromPairs } from 'lodash';

import { normalizeTriggersAndHandlersForResource } from '@flogo-web/lib-client/core';
import { ContributionSchema } from '@flogo-web/core';

import { makeStageItems, makeGraphNodes } from './graph-and-items';
import { ApiStreamResource } from '../interfaces';

export function generateStateFromResource(
  resource: ApiStreamResource,
  schemas: ContributionSchema[]
) {
  const schemaDefs = fromPairs(schemas.map(schema => [schema.ref, schema]));
  const { id, name, description, app, triggers: originalTriggers } = resource;
  const { triggers, handlers } = normalizeTriggersAndHandlersForResource(
    id,
    originalTriggers
  );
  const stages = (resource && resource.data && resource.data.stages) || [];
  const simulation = resource && resource.data && resource.data.simulation;
  const items = makeStageItems(stages, schemaDefs);
  const graph = makeGraphNodes(stages);
  const metadata = resource.metadata;
  return {
    id,
    name,
    description,
    app,
    triggers,
    handlers,
    metadata,
    simulation,
    schemas: schemaDefs,
    mainGraph: graph,
    mainItems: items,
  };
}
