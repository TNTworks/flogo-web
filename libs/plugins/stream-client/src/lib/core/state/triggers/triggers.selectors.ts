import { createSelector } from '@ngrx/store';
import {
  selectHandlers,
  selectTriggers,
  selectAppInfo,
  selectActionId,
} from '../stream.selectors';
import { TriggersState } from '../../../triggers/interfaces/triggers-state';
import { triggersToRenderableTriggers } from '@flogo-web/lib-client/core';

export const getRenderableTriggers = createSelector(
  selectHandlers,
  selectTriggers,
  (handlers, triggers) => triggersToRenderableTriggers(handlers, triggers)
);

export const getTriggersState = createSelector(
  selectAppInfo,
  selectActionId,
  getRenderableTriggers,
  (appInfo, actionId, triggers): TriggersState => {
    return {
      appId: appInfo.appId,
      actionId,
      triggers,
    };
  }
);
