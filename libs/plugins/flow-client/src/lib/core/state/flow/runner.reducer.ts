import * as actions from './flow.actions';
import { FlowState, INITIAL_STATE } from './flow.state';

const ActionType = actions.ActionType;

export function runnerReducer(
  state: FlowState = INITIAL_STATE,
  action: actions.ActionsUnion
): FlowState {
  switch (action.type) {
    case ActionType.CreateBranch:
    case ActionType.TaskItemCreated:
    case ActionType.ItemUpdated:
    case ActionType.CommitItemConfiguration:
      {
        state = markAsConfigChanged(state);
      }
      break;
    case ActionType.RemoveItem:
    case ActionType.MoveItem:
      {
        state = markAsConfigChanged(state);
        state = markAsStructureChanged(state);
        state = removeExecutionDataForItem(state, action.payload.itemId);
      }
      break;
    case ActionType.NewExecutionRegistered:
      {
        state = {
          ...state,
          configChangedSinceLastExecution: false,
        };
      }
      break;
    case ActionType.NewProcessRanFromStart:
      {
        state = {
          ...state,
          lastFullExecution: { ...action.payload },
        };
      }
      break;
    case ActionType.RunFromStart:
      {
        state = resetExecutionResult(state);
        state = {
          ...state,
          structureChangedSinceLastFullExecution: false,
        };
      }
      break;
    case ActionType.RunFromTask:
      {
        state = resetExecutionResult(state);
      }
      break;
    case ActionType.ExecutionStepsUpdate:
      {
        state = {
          ...state,
          lastExecutionResult: {
            ...state.lastExecutionResult,
            ...action.payload.steps,
          },
        };
      }
      break;
  }
  return state;
}

function markAsConfigChanged(state: FlowState) {
  if (state.configChangedSinceLastExecution) {
    return state;
  }
  return {
    ...state,
    configChangedSinceLastExecution: true,
  };
}

function markAsStructureChanged(state: FlowState) {
  if (state.structureChangedSinceLastFullExecution) {
    return state;
  }
  return {
    ...state,
    structureChangedSinceLastFullExecution: true,
  };
}

function removeExecutionDataForItem(flowState: FlowState, itemId: string): FlowState {
  const {
    [itemId]: _itemToRemove,
    ...lastExecutionResult
  } = flowState.lastExecutionResult;
  return {
    ...flowState,
    lastExecutionResult,
  };
}

function resetExecutionResult(state: FlowState) {
  return {
    ...state,
    lastExecutionResult: {},
  };
}
