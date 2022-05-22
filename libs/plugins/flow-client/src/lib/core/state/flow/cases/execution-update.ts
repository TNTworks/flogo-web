import { isEmpty } from 'lodash';
import { Dictionary, FlowGraph, GraphNode } from '@flogo-web/lib-client/core';

import { PayloadOf } from '../../utils';
import { FlowState } from '../flow.state';
import { ExecutionStateUpdated } from '../flow.actions';

const applyChanges = (graph: FlowGraph, nodeChanges: Dictionary<GraphNode>) => {
  if (isEmpty(nodeChanges)) {
    return graph;
  }
  return {
    ...graph,
    nodes: {
      ...graph.nodes,
      ...nodeChanges,
    },
  };
};

function hasExecutedNodes(nodes: Dictionary<GraphNode>) {
  return (
    nodes && !!Object.values(nodes).find(node => node.status && node.status.executed)
  );
}

export function executionUpdate(
  state: FlowState,
  { changes }: PayloadOf<ExecutionStateUpdated>
) {
  return {
    ...state,
    mainGraph: applyChanges(state.mainGraph, changes.mainGraphNodes),
    errorGraph: applyChanges(state.errorGraph, changes.errorGraphNodes),
  };
}
