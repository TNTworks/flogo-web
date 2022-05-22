import { mapValues } from 'lodash';
import { FlowGraph, GraphNode } from '@flogo-web/lib-client/core';

const cleanNodeRunStatus = (node: GraphNode): GraphNode => ({
  ...node,
  status: {
    ...node.status,
    executed: false,
    executionErrored: null,
  },
});

export const cleanGraphRunState = (graph: FlowGraph) => ({
  ...graph,
  nodes: mapValues(graph.nodes, cleanNodeRunStatus),
});
