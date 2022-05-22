import { isEmpty } from 'lodash';

import { parseMetadata } from '@flogo-web/lib-client/core';
import { StreamMetadata } from '@flogo-web/plugins/stream-core';

import { FlogoStreamState } from '../state';
import { createStagesFromGraph } from './graph-and-items';

/* streams-plugin-todo: This function should return the Stream api structure */
export function generateResourceFromState(state: FlogoStreamState): any {
  const metadata = normalizeMetadata(state.metadata);
  const stages = createStagesFromGraph(state.mainItems, state.mainGraph);
  return {
    id: state.id,
    type: 'stream',
    name: state.name,
    description: state.description,
    metadata: metadata || {},
    data: stages ? { stages } : {},
  };
}

function normalizeMetadata(source: StreamMetadata): StreamMetadata {
  if (isEmpty(source)) {
    return null;
  }
  const normalizedMetadata: StreamMetadata = parseMetadata(source);
  if (source.groupBy) {
    normalizedMetadata.groupBy = source.groupBy;
  }
  return normalizedMetadata;
}
