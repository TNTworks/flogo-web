import { GraphNode } from '@flogo-web/lib-client/core';

import { FlogoStreamState } from '../../core/state';
import { Item } from '../../core/interfaces';
import { ITEMS_DICTIONARY_NAME, GRAPH_NAME } from '../../core/constants';

export function commitStageConfiguration(
  state: FlogoStreamState,
  item: Partial<Item>
): FlogoStreamState {
  state = stageUpdate(state, item);
  state = graphUpdate(state, item);

  return {
    ...state,
  };
}

function stageUpdate(state, item): FlogoStreamState {
  const items = state[ITEMS_DICTIONARY_NAME];
  const newItemState = { ...items[item.id], ...item };
  return {
    ...state,
    mainItems: {
      ...items,
      [item.id]: newItemState,
    },
  };
}

function graphUpdate(state, item): FlogoStreamState {
  const graphName = GRAPH_NAME;
  const graph = state[graphName];
  const currentNode = graph.nodes[item.id];
  const newNodeState: GraphNode = {
    ...currentNode,
    ...item,
    title: item.name,
    description: item.description,
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
