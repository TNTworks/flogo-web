import { DiagramGraph, GraphNodeDictionary, NodeType } from '@flogo-web/lib-client/core';

const taskIdFinder = (nodes: GraphNodeDictionary) => {
  return (id: string) => nodes && nodes[id] && nodes[id].type === NodeType.Task;
};

/*
  Case 1. If root element is moved to different place. It will not have a previous parent and it will have previous child.
          It will have a new parent and may have new child
  Case 2. If an element is moved as root. It will have parent, it will have child.
          It will not have a new parent and will have a child
  Case 3. If an element is moved to last element of a row. It will have parent, it may have child.
          It will have a new parent in the branch id and it will not have a new child
  Case 4. And a normal movement from normal place to another normal place
 */

export function updateLinks(
  currentGraph: DiagramGraph,
  movingItemId: string,
  newParentId: string
) {
  const allNodes = currentGraph.nodes;
  let rootId = currentGraph.rootId;
  const findTaskId = taskIdFinder(allNodes);
  const modifiedNodes = {};
  let nodeToMove = allNodes[movingItemId];
  const prevParentId = nodeToMove.parents[0];
  nodeToMove = { ...nodeToMove, parents: [] };
  const prevChildId = nodeToMove.children.find(findTaskId);
  let newParentNode = newParentId && allNodes[newParentId];
  const newChildId = newParentNode ? newParentNode.children.find(findTaskId) : rootId;
  nodeToMove = {
    ...nodeToMove,
    children: replaceNodeIds(nodeToMove.children, prevChildId, newChildId),
  };
  modifiedNodes[movingItemId] = nodeToMove;
  if (newParentId) {
    nodeToMove.parents.push(newParentId);
    newParentNode = {
      ...newParentNode,
      children: replaceNodeIds(newParentNode.children, newChildId, movingItemId),
    };
    modifiedNodes[newParentId] = newParentNode;
  } else {
    rootId = nodeToMove.id;
  }

  if (prevParentId) {
    let prevParentNode = modifiedNodes[prevParentId] || allNodes[prevParentId];
    prevParentNode = {
      ...prevParentNode,
      children: replaceNodeIds(prevParentNode.children, movingItemId, prevChildId),
    };
    modifiedNodes[prevParentId] = prevParentNode;
  } else {
    /* In case where we are moving the root item, then moved item's non branch child becomes root.
     * Here there will be a previous child as a root element without children cannot be moved to root*/
    rootId = prevChildId;
  }

  if (prevChildId) {
    let prevChildNode = modifiedNodes[prevChildId] || allNodes[prevChildId];
    prevChildNode = {
      ...prevChildNode,
      parents: replaceNodeIds(prevChildNode.parents, movingItemId, prevParentId),
    };
    modifiedNodes[prevChildId] = prevChildNode;
  }

  if (newChildId) {
    let newChildNode = modifiedNodes[newChildId] || allNodes[newChildId];
    newChildNode = {
      ...newChildNode,
      parents: replaceNodeIds(newChildNode.parents, newParentId, movingItemId),
    };
    modifiedNodes[newChildId] = newChildNode;
  }

  return {
    ...currentGraph,
    nodes: {
      ...currentGraph.nodes,
      ...modifiedNodes,
    },
    rootId: rootId,
  };
}

/****
 * This function handles the logic to remove a previous node Id and add a new node Id to the array.
 *
 * @param inArray {Array} String array which holds all the children/parents of the tile
 * @param replaceId {string | undefined} Id to be removed from the array
 * @param withId {string | undefined} Id to be added as the first element to the array
 */
function replaceNodeIds(inArray: string[], replaceId: string, withId: string) {
  const replaceArray = inArray.filter(id => id !== replaceId);
  if (withId) {
    replaceArray.unshift(withId);
  }
  return replaceArray;
}
