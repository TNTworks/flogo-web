import { FlogoStreamState } from '../stream.state';
import { TriggerActionsUnion, TriggerActionType } from './triggers.actions';
import { isTriggerSelection } from '../../models/stream/selection';

export function triggersReducer(
  state: FlogoStreamState,
  action: TriggerActionsUnion
): FlogoStreamState {
  switch (action.type) {
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
    default: {
      return state;
    }
  }
}

function removeTriggerAndHandler(state: FlogoStreamState, triggerId: string) {
  const { [triggerId]: handlerToRemove, ...handlers } = state.handlers;
  const { [triggerId]: triggerToRemove, ...triggers } = state.triggers;
  return {
    ...state,
    triggers,
    handlers,
  };
}
