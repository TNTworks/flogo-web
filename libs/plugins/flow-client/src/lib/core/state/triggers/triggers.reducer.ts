import { FlowState } from '../flow/flow.state';
import { TriggerActionsUnion, TriggerActionType } from './triggers.actions';
import { makeTriggerSelection, isTriggerSelection } from '../../models/flow/selection';

export function triggersReducer(
  state: FlowState,
  action: TriggerActionsUnion
): FlowState {
  switch (action.type) {
    // todo: remove once selection display is not needed
    case TriggerActionType.SelectTrigger: {
      return {
        ...state,
        currentSelection: makeTriggerSelection(action.payload.triggerId),
      };
    }
    case TriggerActionType.UpdateHandler: {
      const payload = action.payload;
      return {
        ...state,
        handlers: {
          ...state.handlers,
          [payload.triggerId]: payload.handler,
        },
      };
    }
    case TriggerActionType.UpdateTrigger: {
      return {
        ...state,
        triggers: {
          ...state.triggers,
          [action.payload.id]: { ...action.payload },
        },
      };
    }
    case TriggerActionType.AddTrigger: {
      const { trigger, handler } = action.payload;
      const handlers = state.handlers;
      const triggerId = trigger.id;
      return {
        ...state,
        triggers: {
          ...state.triggers,
          [triggerId]: { ...trigger },
        },
        handlers: {
          ...handlers,
          [triggerId]: {
            ...handler,
            triggerId,
          },
        },
      };
    }
    case TriggerActionType.RemoveHandler: {
      state = removeTriggerAndHandler(state, action.payload);
      const currentSelection = state.currentSelection;
      if (
        isTriggerSelection(currentSelection) &&
        currentSelection.triggerId === action.payload
      ) {
        return {
          ...state,
          currentSelection: null,
        };
      }
      return state;
    }
    case TriggerActionType.CopyTrigger: {
      const payload = action.payload;
      state = removeTriggerAndHandler(state, payload.copiedTriggerId);
      let currentSelection = state.currentSelection;
      const newTrigger = payload.newTrigger;
      if (
        isTriggerSelection(currentSelection) &&
        currentSelection.triggerId === payload.copiedTriggerId
      ) {
        currentSelection = makeTriggerSelection(newTrigger.id);
      }
      return {
        ...state,
        currentSelection,
        triggers: {
          ...state.triggers,
          [newTrigger.id]: newTrigger,
        },
        handlers: {
          ...state.handlers,
          [newTrigger.id]: payload.newHandler,
        },
      };
    }
    default: {
      return state;
    }
  }
}

function removeTriggerAndHandler(state: FlowState, triggerId: string) {
  const { [triggerId]: handlerToRemove, ...handlers } = state.handlers;
  const { [triggerId]: triggerToRemove, ...triggers } = state.triggers;
  return {
    ...state,
    triggers,
    handlers,
  };
}
