import { isEmpty, partialRight, times } from 'lodash';
import { GraphNode, GraphNodeDictionary, NodeType } from '@flogo-web/lib-client/core';
import { NodeMatrix } from './matrix';

interface TranslateContext {
  parentNode: GraphNode;
  nodes: GraphNodeDictionary;
}

export function nodesToNodeMatrix(
  rootNode: GraphNode,
  nodes: GraphNodeDictionary
): NodeMatrix {
  const matrix: NodeMatrix = [[rootNode]];
  translateChildren({ parentNode: rootNode, nodes }, matrix);
  return matrix;
}

const arrayOfNulls = partialRight<number, Function, null[]>(times, () => null);

export function translateChildren(
  context: TranslateContext,
  matrix: NodeMatrix
): NodeMatrix {
  const children = retrieveChildrenNodes(context).sort(nonBranchesFirst);
  if (isEmpty(children)) {
    return matrix;
  }
  const currentRowIndex = matrix.length - 1;
  const currentRow = matrix[currentRowIndex];
  children.forEach((node: GraphNode) => {
    if (node.type === NodeType.Branch) {
      const padding = currentRow.indexOf(context.parentNode);
      const newRow: GraphNode[] = arrayOfNulls(padding);
      newRow.push(node);
      matrix.push(newRow);
    } else {
      currentRow.push(node);
    }
    translateChildren({ ...context, parentNode: node }, matrix);
  });
  return matrix;
}

function retrieveChildrenNodes({ parentNode, nodes }: TranslateContext) {
  if (!parentNode || !parentNode.children) {
    return [];
  }
  return parentNode.children.map(nodeId => nodes[nodeId]);
}

function nonBranchesFirst(nodeA: GraphNode, nodeB: GraphNode): number {
  if (nodeA.type === nodeB.type) {
    return 0;
  }
  return nodeA.type === NodeType.Branch ? 1 : -1;
}
