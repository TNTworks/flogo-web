import { FlowGraph, GraphNode, NodeType } from '@flogo-web/lib-client/core';
import { insertNode } from './insert-node';

export function addNewBranch(
  flowGraph: FlowGraph,
  parentId: string,
  branchId: string
): FlowGraph {
  const parentNode = flowGraph.nodes[parentId];
  if (!parentNode || parentNode.type === NodeType.Branch) {
    return flowGraph;
  }
  const branchNode: GraphNode = {
    id: branchId,
    type: NodeType.Branch,
    parents: [parentNode.id],
    children: [],
    features: {
      canBranch: false,
      canHaveChildren: true,
      deletable: true,
    },
    status: {},
  };
  return insertNode(flowGraph, branchNode, parentId);
}
