import { isEmpty, mapValues } from 'lodash';
import { TriggerConfigureState, TriggerConfigureTab } from '../../../interfaces';

export function setEnabledStatusToTabs(
  state: TriggerConfigureState
): TriggerConfigureState {
  return {
    ...state,
    tabs: mapValues(state.tabs, (tab, tabId) => {
      if (tab.type === 'settings') {
        return tab;
      }
      return setEnabledStatusToTab(tab, state.fields[tabId]);
    }),
  };
}

export function setEnabledStatusToTab(tab: TriggerConfigureTab, fields) {
  const isEnabled = !isEmpty(fields);
  if (isEnabled !== tab.isEnabled) {
    tab = { ...tab, isEnabled };
  }
  return tab;
}
