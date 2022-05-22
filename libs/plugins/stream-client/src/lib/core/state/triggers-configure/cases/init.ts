import { TriggerSchema } from '@flogo-web/core';
import { Dictionary, Trigger } from '@flogo-web/lib-client/core';
import { FlogoStreamState } from '../../stream.state';
import { OpenConfigureWithSelection } from '../trigger-configure.actions';
import {
  TriggerConfigureState,
  TriggerConfigureTab,
  TriggerConfigureTabType,
  TriggerConfigureTrigger,
} from '../../../interfaces';
import { getMicroServiceTabs } from './tab-base-by-profile';
import { setEnabledStatusToTabs } from './set-enabled-status-to-tabs';

export function init(
  streamState: FlogoStreamState,
  payload: OpenConfigureWithSelection['payload']
): TriggerConfigureState {
  const { triggerId: selectedTriggerId, triggerSchemas } = payload;
  let triggerConfigureState = {
    isOpen: true,
    selectedTriggerId,
    currentTab: TriggerConfigureTabType.Settings,
    schemas: payload.triggerSchemas,
    triggers: null,
    tabs: null,
    fields: null,
  };
  triggerConfigureState = initTriggerConfigureState(
    triggerConfigureState,
    Object.values(streamState.triggers),
    triggerSchemas
  );
  return setEnabledStatusToTabs(triggerConfigureState);
}

function initTriggerConfigureState(
  baseState: TriggerConfigureState,
  appTriggers: Trigger[],
  triggersSchemas: Dictionary<TriggerSchema>
): TriggerConfigureState {
  const triggersForConfigure: Dictionary<TriggerConfigureTrigger> = {};
  let allTabs: Dictionary<TriggerConfigureTab> = {};
  const fields = {};
  appTriggers.forEach(trigger => {
    const tabsForTrigger = createTabsForTrigger(trigger.id);
    allTabs = { ...allTabs, ...tabsForTrigger };
    triggersForConfigure[trigger.id] = createTriggerState(trigger, [
      ...Object.keys(tabsForTrigger),
    ]);
  });
  return {
    ...baseState,
    triggers: triggersForConfigure,
    tabs: allTabs,
    fields,
  };
}

function createTabsForTrigger(triggerId: string): Dictionary<TriggerConfigureTab> {
  return getMicroServiceTabs().reduce((tabs, tabBase) => {
    tabs[`${triggerId}.${tabBase.type}`] = {
      triggerId,
      ...tabBase,
      isValid: true,
      isDirty: false,
      isEnabled: true,
      isPending: false,
    };
    return tabs;
  }, {});
}

function createTriggerState(trigger: Trigger, tabIds: string[]): TriggerConfigureTrigger {
  return {
    id: trigger.id,
    tabs: tabIds,
    isValid: true,
    isDirty: false,
    isSaving: false,
  };
}
