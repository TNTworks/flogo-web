import { BRANCH_PREFIX } from '@flogo-web/lib-client/diagram';

export function isInsertBetween(parent, graph) {
  if (parent) {
    const node = graph.nodes[parent];
    const nonBranchChild = getNonBranchChild(node);
    return nonBranchChild.length > 0;
  } else {
    return !!graph.rootId;
  }
}

export function categorizeChildren(node) {
  return {
    branches: getBranchChildren(node),
    nonBranches: getNonBranchChild(node),
  };
}

function getBranchChildren(node) {
  return node.children.filter(child => child.startsWith(BRANCH_PREFIX));
}

function getNonBranchChild(node) {
  return node.children.filter(child => !child.startsWith(BRANCH_PREFIX));
}
