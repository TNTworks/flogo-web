import { isEmpty } from 'lodash';

import { Dictionary, DiagramGraph } from '@flogo-web/lib-client/core';

import { Item } from '../../interfaces';

export function createStagesFromGraph(items: Dictionary<Item>, graph: DiagramGraph) {
  if (isEmpty(items)) {
    return null;
  }
  const stages = [];
  let currentNode = graph.nodes[graph.rootId];
  stages.push(items[currentNode.id]);
  while (currentNode.children.length > 0) {
    const [nextNodeId] = currentNode.children;
    currentNode = graph.nodes[nextNodeId];
    stages.push(items[currentNode.id]);
  }
  return stages;
}
