import { GraphNode } from '@flogo-web/lib-client/core';
import { FlowState } from '../flow.state';
import { getGraphName, getItemsDictionaryName } from '../../utils';
import { HandlerType } from '../../../models';
import { isBranchConfigured } from '../../../models/flow/is-branch-configured';
import { BaseItemTask, Item, ItemBranch } from '../../../interfaces/flow';

export function nodeUpdate(
  state: FlowState,
  payload: {
    handlerType: HandlerType;
    item?: { id: string } & Partial<ItemBranch>;
  }
) {
  const { handlerType, item } = payload;
  if (!item) {
    return state;
  }
  const graphName = getGraphName(handlerType);
  const graph = state[graphName];
  const currentNode = graph.nodes[item.id];
  const newNodeState: GraphNode = {
    ...currentNode,
    ...item,
    status: {
      isBranchConfigured: isBranchConfigured(item.condition),
    },
  };
  return {
    ...state,
    [graphName]: {
      ...graph,
      nodes: {
        ...graph.nodes,
        [item.id]: newNodeState,
      },
    },
  };
}

export function itemUpdate(
  state: FlowState,
  payload: { handlerType: HandlerType; item?: { id: string } & Partial<Item> }
) {
  const { handlerType, item } = payload;
  if (!item) {
    return state;
  }
  const itemsDictionaryName = getItemsDictionaryName(handlerType);
  const items = state[itemsDictionaryName];
  const newItemState = { ...items[item.id], ...item };
  return {
    ...state,
    [itemsDictionaryName]: {
      ...items,
      [item.id]: newItemState,
    },
  };
}

export function graphUpdate(
  state: FlowState,
  payload: {
    handlerType: HandlerType;
    item?: { id: string } & Partial<BaseItemTask>;
  }
) {
  const { handlerType, item } = payload;
  if (!item) {
    return state;
  }
  const graphName = getGraphName(handlerType);
  const graph = state[graphName];
  const currentNode = graph.nodes[item.id];
  const newNodeState: GraphNode = {
    ...currentNode,
    ...item,
    title: item.name,
    description: item.description,
    status: {
      iterable: !!item.settings.iterate,
    },
  };
  return {
    ...state,
    [graphName]: {
      ...graph,
      nodes: {
        ...graph.nodes,
        [item.id]: newNodeState,
      },
    },
  };
}
