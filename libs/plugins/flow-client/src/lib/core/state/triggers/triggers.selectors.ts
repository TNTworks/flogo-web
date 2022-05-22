import { createSelector } from '@ngrx/store';
import {
  selectActionId,
  selectFlowMetadata,
  selectTriggers,
  selectHandlers,
  selectCurrentSelection,
  selectAppInfo,
} from '../flow/flow.selectors';
import { TriggersState } from '../../../triggers/interfaces/triggers-state';
import { triggersToRenderableTriggers } from '../../../triggers/models/triggers-to-renderable-triggers';
import { SelectionType } from '../../models';

export const getRenderableTriggers = createSelector(
  selectHandlers,
  selectTriggers,
  (handlers, triggers) => triggersToRenderableTriggers(handlers, triggers)
);

export const selectCurrentTrigger = createSelector(
  selectCurrentSelection,
  selectTriggers,
  selectHandlers,
  (currentSelection, triggers, handlers) => {
    if (!currentSelection || currentSelection.type !== SelectionType.Trigger) {
      return null;
    }
    const { triggerId } = currentSelection;
    return {
      ...triggers[triggerId],
      handler: handlers[triggerId],
    };
  }
);

export const getTriggersState = createSelector(
  selectAppInfo,
  selectActionId,
  getRenderableTriggers,
  selectFlowMetadata,
  selectCurrentTrigger,
  (appInfo, actionId, triggers, flowMetadata, currentTrigger): TriggersState => {
    return {
      appId: appInfo.appId,
      actionId,
      triggers,
      flowMetadata,
      currentTrigger,
    };
  }
);
