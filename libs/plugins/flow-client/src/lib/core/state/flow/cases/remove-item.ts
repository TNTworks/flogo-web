import { ItemSubflow } from '../../../interfaces/flow';
import { FlowState } from '../flow.state';
import { RemoveItem } from '../flow.actions';
import { getGraphName, getItem, getItemsDictionaryName, PayloadOf } from '../../utils';
import { removeNode } from '../../../models/flow/remove-node';
import { CurrentSelection, SelectionType } from '../../../models';
import { getLinkedSubflow } from './get-linked-subflow';
import { removeSubschemaIfNotUsed } from './remove-subschema';

export function removeItem(
  prevState: FlowState,
  payload: PayloadOf<RemoveItem>
): FlowState {
  const { handlerType, itemId } = payload;
  const itemToRemove = getItem(prevState, handlerType, itemId);

  let nextState = applyRemoveItem(prevState, payload);
  if (nextState === prevState) {
    return prevState;
  }

  nextState = cleanUpCurrentSelection(nextState, itemId);

  const linkedSubflowId = getLinkedSubflow(itemToRemove as ItemSubflow);
  nextState = removeSubschemaIfNotUsed(nextState, linkedSubflowId);

  return nextState;
}

function applyRemoveItem(state: FlowState, payload: PayloadOf<RemoveItem>): FlowState {
  const { handlerType, itemId } = payload;
  const graphName = getGraphName(handlerType);
  const itemDictionaryName = getItemsDictionaryName(handlerType);
  const result = removeNode(
    { flowGraph: state[graphName], items: state[itemDictionaryName] },
    itemId
  );
  if (result.flowGraph !== state[graphName]) {
    state = {
      ...state,
      [graphName]: result.flowGraph,
      [itemDictionaryName]: result.items,
    };
  }
  return state;
}

function cleanUpCurrentSelection(state: FlowState, itemId): FlowState {
  return shouldClearCurrentSelection(state.currentSelection, itemId)
    ? { ...state, currentSelection: null }
    : state;
}

function shouldClearCurrentSelection(
  selection: CurrentSelection,
  taskIdToRemove: string
): boolean {
  if (!selection) {
    return false;
  }
  let taskId;
  if (selection.type === SelectionType.Task) {
    taskId = selection.taskId;
  } else if (selection.type === SelectionType.InsertTask) {
    taskId = selection.parentId;
  }
  if (!taskId) {
    return false;
  }
  return taskIdToRemove === taskId;
}
