import { ItemSubflow } from '../../../interfaces/flow';
import { getLinkedSubflow } from './get-linked-subflow';
import { FlowState } from '../flow.state';

export function removeSubschemaIfNotUsed(state: FlowState, subflowId: string) {
  if (!isSubflowUsedAgain(state, subflowId)) {
    const { [subflowId]: subflowToRemove, ...subflows } = state.linkedSubflows;
    state = { ...state, linkedSubflows: subflows };
  }
  return state;
}

function isSubflowUsedAgain(state: FlowState, subflowId: string) {
  const isReferencedSubflow = (t: ItemSubflow) => getLinkedSubflow(t) === subflowId;
  return Boolean(
    Object.values(state.mainItems).find(isReferencedSubflow) ||
      Object.values(state.errorItems).find(isReferencedSubflow)
  );
}
