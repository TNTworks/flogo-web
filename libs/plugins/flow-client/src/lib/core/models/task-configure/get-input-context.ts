import { defaultsDeep, get } from 'lodash';
import { ActivitySchema } from '@flogo-web/core';
import { Dictionary, GraphNode, NodeType } from '@flogo-web/lib-client/core';
import { Item, ItemSubflow, ItemTask } from '../../interfaces/flow';
import { FlowState } from '../../state';
import { makeErrorTask } from '../make-error-task';
import { FlowMetadata } from '../../../task-configurator/models';
import { isSubflowTask } from '../flow/is-subflow-task';
import { mergeItemWithSchema, PartialActivitySchema } from '../merge-item-with-schema';

// todo: fcastill - specify return interfaces
export function getInputContext(taskId: string, state: FlowState): any[] {
  const scope: any[] = isItemInErrorHandlerPath(taskId, state)
    ? getPrecedingTasksForErrorHandler(taskId, state)
    : getPrecedingTasksForMainHandler(taskId, state);
  const metadata = getFlowMetadata(state);
  scope.push(metadata);
  return scope;
}

export function getFlowMetadata(flowState: FlowState): FlowMetadata {
  return defaultsDeep({ type: 'metadata' }, flowState.metadata, {
    input: [],
    output: [],
  });
}

function getPrecedingTasksForMainHandler(taskId: string, state: FlowState) {
  const { mainGraph, mainItems: items } = state;
  return findPrecedingTasks(
    mainGraph.rootId,
    taskId,
    { nodes: mainGraph.nodes, items },
    state
  );
}

export function getPrecedingTasksForErrorHandler(itemId: string, state: FlowState) {
  const allItemsInMainHandler = mapItemIdsToTasks(
    Object.keys(state.mainGraph.nodes),
    { nodes: state.mainGraph.nodes, items: state.mainItems },
    state
  );
  const { errorGraph, errorItems } = state;
  return [
    ...allItemsInMainHandler,
    makeErrorTask(),
    ...findPrecedingTasks(
      errorGraph.rootId,
      itemId,
      { nodes: errorGraph.nodes, items: errorItems },
      state
    ),
  ];
}

function findPrecedingTasks(
  fromItemId: string,
  toItemId: string,
  from: { nodes: Dictionary<GraphNode>; items: Dictionary<Item> },
  flowState: FlowState
) {
  const precedingItemIds = findPathToNode(fromItemId, toItemId, from.nodes);
  // ignore last item as it is the very same selected node
  precedingItemIds.pop();
  return mapItemIdsToTasks(precedingItemIds, from, flowState);
}

function isItemInErrorHandlerPath(taskId: string, state: FlowState) {
  return !!state.errorItems[taskId];
}

/**
 * Finds a path from starting node to target node
 * Assumes we have a tree structure, meaning we have no cycles
 * @param {string} startNodeId
 * @param {string} targetNodeId
 * @param {Dictionary<GraphNode>} nodes
 * @returns string[] list of node ids
 */
export function findPathToNode(
  startNodeId: string,
  targetNodeId: string,
  nodes: Dictionary<GraphNode>
) {
  let queue = [[startNodeId]];

  while (queue.length > 0) {
    const path = queue.shift();
    const nodeId = path[path.length - 1];

    if (nodeId === targetNodeId) {
      return path;
    }

    const children = nodes[nodeId].children;
    if (children) {
      const paths = children.map(child => path.concat(child));
      queue = queue.concat(paths);
    }
  }
  return [];
}

const isSubflowItem = (item: Item): item is ItemSubflow => isSubflowTask(item.type);

function mapItemIdsToTasks(
  nodeIds: any[],
  from: { nodes: Dictionary<GraphNode>; items: Dictionary<Item> },
  flowState: FlowState
) {
  const canUseItemOutputs = (node: GraphNode) => node.type === NodeType.Task;
  return nodeIds
    .map(nodeId => {
      const node = from.nodes[nodeId];
      if (canUseItemOutputs(node)) {
        const item = <ItemTask>from.items[nodeId];
        let schema: PartialActivitySchema = flowState.schemas[item.ref] as ActivitySchema;
        if (isSubflowItem(item)) {
          const subFlowSchema = flowState.linkedSubflows[item.settings.flowPath];
          schema = { outputs: get(subFlowSchema, 'metadata.output', []) };
        }
        return mergeItemWithSchema(item, schema);
      } else {
        return null;
      }
    })
    .filter(Boolean);
}
