import { FlowGraph, GraphNode, NodeType } from '@flogo-web/lib-client/core';
import { insertNode } from './insert-node';

export type NewNode = { id: string } & Partial<GraphNode>;

export function addNewNode(flowGraph: FlowGraph, newNode: NewNode) {
  const parents = newNode.parents || [];
  const [parentId] = parents;
  const node: GraphNode = {
    ...newNode,
    type: NodeType.Task,
    parents: parentId ? [parentId] : [],
    children: [],
    features: {
      canBranch: false,
      canHaveChildren: true,
      deletable: true,
      ...newNode.features,
    },
    status: {},
  };
  return insertNode(flowGraph, node, parentId);
}
