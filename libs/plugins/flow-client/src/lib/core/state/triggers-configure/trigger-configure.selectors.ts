import { createSelector, select, Store } from '@ngrx/store';
import { switchMap, map } from 'rxjs/operators';
import { of as observableOf } from 'rxjs';

import { TriggerStatus } from '@flogo-web/lib-client/trigger-shared';

// todo: move to shared location
import { CurrentTriggerState } from '../../../triggers/configurator/interfaces';
import {
  selectFlowMetadata,
  selectHandlers,
  selectTriggerConfigure,
  selectTriggers,
  selectApp,
  selectActionId,
  getInstalledFunctions,
} from '../flow/flow.selectors';
import { FlowState } from '../flow/flow.state';
import { createTriggerConfigureFields } from './cases/create-trigger-configure-fields';
import { normalizeSettings } from './cases/normalize-settings';

export const getSchemas = createSelector(selectTriggerConfigure, state => state.schemas);
export const getAllTabs = createSelector(selectTriggerConfigure, state => state.tabs);

export const selectCurrentTriggerId = createSelector(
  selectTriggerConfigure,
  triggerConfigureState =>
    triggerConfigureState ? triggerConfigureState.selectedTriggerId : null
);

const selectTriggerConfigureTriggers = createSelector(
  selectTriggerConfigure,
  triggerConfigureState => triggerConfigureState.triggers
);
export const getTriggerStatuses = createSelector(
  selectTriggerConfigureTriggers,
  selectTriggers,
  (triggerConfigure, triggers): TriggerStatus[] =>
    Object.keys(triggerConfigure).map(
      (triggerId): TriggerStatus => {
        return {
          id: triggerId,
          name: triggers[triggerId].name,
          isValid: triggerConfigure[triggerId].isValid,
          isDirty: triggerConfigure[triggerId].isDirty,
        };
      }
    )
);

const getCurrentTriggerConfig = createSelector(
  selectTriggerConfigureTriggers,
  selectCurrentTriggerId,
  (triggersState, currentTriggerId) => {
    return triggersState[currentTriggerId];
  }
);

export const getCurrentTabType = createSelector(
  selectTriggerConfigure,
  triggerConfigure => {
    return triggerConfigure ? triggerConfigure.currentTab : null;
  }
);

const selectCurrentTabs = createSelector(
  getCurrentTriggerConfig,
  getAllTabs,
  (currentTrigger, tabs) => currentTrigger.tabs.map(tabId => tabs[tabId])
);

export const getCurrentTabs = (store: Store<FlowState>) => {
  const empty$ = observableOf([]);
  const currentTabs$ = store.pipe(select(selectCurrentTabs));
  return store.pipe(
    select(getHasTriggersConfigure),
    switchMap(isTriggerInitialized => (isTriggerInitialized ? currentTabs$ : empty$))
  );
};

export const getHasTriggersConfigure = createSelector(
  selectTriggerConfigure,
  triggerConfigure => !!triggerConfigure
);

export const getCurrentTriggerIsSaving = (store: Store<FlowState>) => {
  const currentSavingState$ = store.pipe(
    select(
      createSelector(
        selectTriggerConfigureTriggers,
        selectCurrentTriggerId,
        (triggers, triggerId) => triggers[triggerId].isSaving
      )
    )
  );
  return store.pipe(
    select(getHasTriggersConfigure),
    switchMap(isTriggerInitialized =>
      isTriggerInitialized ? currentSavingState$ : observableOf(false)
    )
  );
};

export const getCurrentTriggerOverallStatus = (store: Store<FlowState>) => {
  const empty$ = observableOf({ isDirty: false, isValid: true });
  const currentTabs$ = store.pipe(
    select(selectCurrentTabs),
    map(currentTabs => {
      return {
        isDirty: !!currentTabs.find(tab => tab.isDirty),
        isValid: !currentTabs.find(tab => !tab.isValid),
        isPending: !!currentTabs.find(tab => tab.isPending),
      };
    })
  );
  return store.pipe(
    select(getHasTriggersConfigure),
    switchMap(isTriggerInitialized => (isTriggerInitialized ? currentTabs$ : empty$))
  );
};

export const getCurrentSchema = createSelector(
  selectTriggers,
  selectCurrentTriggerId,
  getSchemas,
  (triggers, currentTriggerId, schemas) => {
    const trigger = triggers[currentTriggerId];
    return schemas[trigger.ref];
  }
);

const getCurrentTrigger = createSelector(
  selectCurrentTriggerId,
  selectTriggers,
  (currentTriggerId, triggers) => triggers[currentTriggerId]
);

const getCurrentHandler = createSelector(
  selectCurrentTriggerId,
  selectHandlers,
  (currentTriggerId, handlers) => handlers[currentTriggerId]
);

export const getConfigureState = createSelector(
  selectFlowMetadata,
  getCurrentSchema,
  getCurrentTrigger,
  getCurrentHandler,
  selectApp,
  getInstalledFunctions,
  (
    flowMetadata,
    schema,
    currentTrigger,
    currentHandler,
    app,
    functions
  ): CurrentTriggerState => {
    const trigger = {
      ...currentTrigger,
      settings: normalizeSettings(currentTrigger.settings),
    };
    const handler = {
      ...currentHandler,
      settings: normalizeSettings(currentHandler.settings),
    };
    return {
      flowMetadata,
      schema,
      trigger,
      handler,
      appId: app.id,
      appProperties: app.properties,
      fields: createTriggerConfigureFields(trigger, handler, schema),
      functions,
    };
  }
);

export const getSaveInfo = createSelector(
  selectActionId,
  selectCurrentTriggerId,
  getCurrentHandler,
  (actionId, triggerId, handler) => ({ actionId, triggerId, handler })
);
