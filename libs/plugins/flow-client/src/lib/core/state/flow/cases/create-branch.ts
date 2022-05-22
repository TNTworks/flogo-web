import { FlowState } from '../flow.state';
import { getGraphName, getItemsDictionaryName, PayloadOf } from '../../utils';
import { CreateBranch } from '../flow.actions';
import { ItemFactory } from '../../../models/graph-and-items/item-factory';
import { addNewBranch } from '../../../models/flow/add-new-branch';
import { makeInsertSelection } from '../../../models/flow/selection';

export function createBranch(state: FlowState, payload: PayloadOf<CreateBranch>) {
  const graphName = getGraphName(payload.handlerType);
  const itemsDictionaryName = getItemsDictionaryName(payload.handlerType);
  const itemBranch = ItemFactory.makeBranch({
    taskID: payload.newBranchId,
    condition: 'true',
  });
  return {
    ...state,
    currentSelection: makeInsertSelection(payload.handlerType, itemBranch.id),
    [itemsDictionaryName]: {
      ...state[itemsDictionaryName],
      [itemBranch.id]: itemBranch,
    },
    [graphName]: addNewBranch(state[graphName], payload.parentId, itemBranch.id),
  };
}
