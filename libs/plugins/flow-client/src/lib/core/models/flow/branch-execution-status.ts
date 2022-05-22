import { GraphNode, Dictionary, NodeType } from '@flogo-web/lib-client/core';

export function isBranchExecuted(node: GraphNode, nodes: Dictionary<GraphNode>): boolean {
  if (!node || !nodes || !isBranchNode(node)) {
    return false;
  }
  const parents = node.parents || [];
  const children = node.children || [];

  if (!parents.length || !children.length) {
    return false;
  }

  const atLeastOneNodeHasExecuted = executedNodeFinder(nodes);
  return atLeastOneNodeHasExecuted(parents) && atLeastOneNodeHasExecuted(children);
}

function isBranchNode(node: GraphNode) {
  return node.type === NodeType.Branch;
}

function executedNodeFinder(nodes: Dictionary<GraphNode>) {
  return (nodeIds: string[]) =>
    !!nodeIds
      .map(nodeId => nodes[nodeId])
      .find(relatedNode => relatedNode.status.executed);
}
