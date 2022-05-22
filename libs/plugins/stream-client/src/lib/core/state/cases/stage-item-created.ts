import { DiagramGraph, GraphNode, NodeType } from '@flogo-web/lib-client/core';

import { FlogoStreamState } from '../stream.state';
import { StageItemCreated } from '../stream.actions';
import { makeStageSelection } from '../../models/stream/selection';
import { ITEMS_DICTIONARY_NAME, GRAPH_NAME } from '../../constants';

export function stageItemCreated(
  state: FlogoStreamState,
  payload: StageItemCreated['payload']
): FlogoStreamState {
  const { item, node } = payload;
  const itemsDictionary = state[ITEMS_DICTIONARY_NAME];
  state = {
    ...state,
    currentSelection: makeStageSelection(node.id),
    [GRAPH_NAME]: addNewNode(state[GRAPH_NAME], node as GraphNode),
    [ITEMS_DICTIONARY_NAME]: {
      ...itemsDictionary,
      [item.id]: { ...item },
    },
  };
  return state;
}

function addNewNode(graph: DiagramGraph, newNode: GraphNode): DiagramGraph {
  const parents = newNode.parents || [];
  const [parentId] = parents;
  const node: GraphNode = {
    ...newNode,
    type: NodeType.Task,
    parents: parentId ? [parentId] : [],
    children: [],
    features: {
      canBranch: false,
      canHaveChildren: true,
      deletable: true,
      ...newNode.features,
    },
    status: {},
  };
  let nodes = graph.nodes;
  let rootId = graph.rootId;
  const parent = graph.nodes[parentId];
  const isInsertBetween = parentId ? parent.children.length > 0 : !!rootId;
  if (parent) {
    if (isInsertBetween) {
      const child = {
        ...nodes[parent.children[0]],
      };
      node.children = [...parent.children];
      nodes = {
        ...nodes,
        [child.id]: { ...child, parents: [node.id] },
      };
    }
    nodes = {
      ...nodes,
      [parent.id]: { ...parent, children: [node.id] },
    };
  } else {
    // case when adding a tile before the root tile of the diagram
    if (isInsertBetween) {
      const child = {
        ...nodes[graph.rootId],
        parents: [node.id],
      };
      node.children = [graph.rootId];
      nodes = {
        ...nodes,
        [child.id]: child,
      };
    }
    rootId = node.id;
  }
  return {
    ...graph,
    rootId,
    nodes: {
      ...nodes,
      [node.id]: node,
    },
  };
}
