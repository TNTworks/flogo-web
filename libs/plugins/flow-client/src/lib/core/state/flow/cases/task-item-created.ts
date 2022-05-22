import { Resource } from '@flogo-web/core';
import { FlowState } from '../flow.state';
import { getGraphName, getItemsDictionaryName, PayloadOf } from '../../utils';
import { TaskItemCreated } from '../flow.actions';
import { addNewNode } from '../../../models/flow/add-new-node';
import { makeTaskSelection } from '../../../models/flow/selection';

export function taskItemCreated(
  state: FlowState,
  payload: PayloadOf<TaskItemCreated>
): FlowState {
  const { handlerType, item, node } = payload;
  const graphName = getGraphName(handlerType);
  const itemsDictionaryName = getItemsDictionaryName(handlerType);
  const itemsDictionary = state[itemsDictionaryName];
  state = {
    ...state,
    currentSelection: makeTaskSelection(handlerType, node.id),
    [graphName]: addNewNode(state[graphName], node),
    [itemsDictionaryName]: {
      ...itemsDictionary,
      [item.id]: { ...item },
    },
  };
  state = registerSubflowSchema(state, payload.subflowSchema);
  return state;
}

function registerSubflowSchema(state: FlowState, subflowSchema?: Resource): FlowState {
  if (subflowSchema) {
    state = {
      ...state,
      linkedSubflows: {
        ...state.linkedSubflows,
        [subflowSchema.id]: { ...subflowSchema },
      },
    };
  }
  return state;
}
