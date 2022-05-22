import { FlowGraph, GraphNode } from '@flogo-web/lib-client/core';
import { BRANCH_PREFIX } from '@flogo-web/lib-client/diagram';
import { isInsertBetween, categorizeChildren } from './is-insert-between';

export function insertNode(
  flowGraph: FlowGraph,
  node: GraphNode,
  parentId?: string
): FlowGraph {
  let parent = flowGraph.nodes[parentId];
  let nodes = flowGraph.nodes;
  let rootId = flowGraph.rootId;
  const isInBetween =
    !node.id.startsWith(BRANCH_PREFIX) && isInsertBetween(parent?.id, flowGraph);
  if (parent) {
    const { branches, nonBranches } = categorizeChildren(parent);
    if (isInBetween) {
      node = {
        ...node,
        children: [...nonBranches],
      };
      parent = { ...parent, children: [...branches, node.id] };
    } else {
      parent = { ...parent, children: [...parent.children, node.id] };
    }
    nodes = {
      ...nodes,
      [parent.id]: { ...parent },
    };
  } else {
    // case: adding a tile before the root tile of the diagram
    if (isInBetween) {
      const child = {
        ...nodes[flowGraph.rootId],
        parents: [node.id],
      };
      node = {
        ...node,
        children: [flowGraph.rootId],
      };
      nodes = {
        ...nodes,
        [child.id]: child,
      };
    }
    rootId = node.id;
  }
  return {
    ...flowGraph,
    rootId,
    nodes: {
      ...nodes,
      [node.id]: node,
    },
  };
}
