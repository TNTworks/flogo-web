import { TriggerConfigureState, TriggerConfigureTabType } from '../../interfaces';
import { FlogoStreamState } from '../stream.state';
import {
  TriggerConfigureActionType,
  TriggerConfigureActionUnion,
} from './trigger-configure.actions';
import { init } from './cases/init';
import { tabStatusReducer } from './cases/tab-status-reducer';

export function reducer(
  streamState: FlogoStreamState,
  action: TriggerConfigureActionUnion
): FlogoStreamState {
  const prevState = streamState.triggerConfigure;
  const triggerConfigureState = triggerConfigureReducer(prevState, action, streamState);
  if (prevState !== triggerConfigureState) {
    return {
      ...streamState,
      triggerConfigure: triggerConfigureState,
    };
  }
  return streamState;
}

export function triggerConfigureReducer(
  state: TriggerConfigureState,
  action: TriggerConfigureActionUnion,
  streamState: FlogoStreamState
): TriggerConfigureState {
  switch (action.type) {
    case TriggerConfigureActionType.OpenConfigureWithSelection: {
      return init(streamState, action.payload);
    }
    case TriggerConfigureActionType.CloseConfigure:
      return null;
    case TriggerConfigureActionType.SelectTrigger:
      return {
        ...state,
        selectedTriggerId: action.payload,
        currentTab: TriggerConfigureTabType.Settings,
      };
    case TriggerConfigureActionType.SelectTab:
      return {
        ...state,
        currentTab: action.payload,
      };
    case TriggerConfigureActionType.CofigureStatusChanged: {
      const { triggerId, groupType, newStatus } = action.payload;
      const groupId = `${triggerId}.${groupType}`;
      return tabStatusReducer(state, groupId, newStatus);
    }
    case TriggerConfigureActionType.SaveTriggerStarted: {
      const { triggerId } = action.payload;
      return updateTriggerSavingStatus(state, triggerId, true);
    }
    case TriggerConfigureActionType.SaveTriggerCompleted: {
      const { triggerId } = action.payload;
      return updateTriggerSavingStatus(state, triggerId, false);
    }
    default: {
      return state;
    }
  }
}

function updateTriggerSavingStatus(
  state: TriggerConfigureState,
  triggerId: string,
  isSaving: boolean
) {
  if (!state) {
    return state;
  }
  const triggers = state.triggers;
  if (triggers[triggerId].isSaving === isSaving) {
    return state;
  }
  return {
    ...state,
    triggers: {
      ...triggers,
      [triggerId]: {
        ...triggers[triggerId],
        isSaving,
      },
    },
  };
}
