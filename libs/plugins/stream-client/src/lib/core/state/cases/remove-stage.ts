import { isEmpty } from 'lodash';

import { FlogoStreamState } from '../stream.state';
import { SelectionType } from '../../models/selection';

export function removeStage(
  prevState: FlogoStreamState,
  nodeId: string
): FlogoStreamState {
  let { mainGraph: streamGraph, mainItems, currentSelection } = prevState;
  if (isEmpty(mainItems)) {
    return prevState;
  }
  const { [nodeId]: nodeToRemove, ...resultNodes } = streamGraph.nodes;
  const { [nodeId]: itemToRemove, ...resultItems } = mainItems;
  if (!nodeToRemove) {
    return prevState;
  }
  streamGraph = { ...streamGraph, nodes: resultNodes };
  mainItems = resultItems;
  if (nodeToRemove.parents.length <= 0 && nodeToRemove.children.length <= 0) {
    return {
      ...prevState,
      mainGraph: streamGraph,
      mainItems,
    };
  }
  const [parentId] = nodeToRemove.parents;
  if (parentId) {
    const parentNode = streamGraph.nodes[parentId];
    parentNode.children = nodeToRemove.children;
  }
  const [childId] = nodeToRemove.children;
  if (childId) {
    const childNode = streamGraph.nodes[childId];
    childNode.parents = nodeToRemove.parents;
  }
  if (!parentId) {
    streamGraph.rootId = childId;
  }
  if (
    currentSelection &&
    currentSelection.type === SelectionType.Task &&
    currentSelection.taskId === nodeToRemove.id
  ) {
    currentSelection = null;
  }
  return {
    ...prevState,
    mainGraph: streamGraph,
    mainItems,
  };
}
