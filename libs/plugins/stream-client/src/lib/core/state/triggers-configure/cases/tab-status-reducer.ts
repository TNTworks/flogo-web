import { TriggerConfigureState, TriggerConfigureTab } from '../../../interfaces';

const COMPARABLE_PROPERTIES: Array<keyof TriggerConfigureTab> = [
  'isValid',
  'isDirty',
  'isEnabled',
  'isPending',
];
function didStateChange(prevTab: TriggerConfigureTab, nextTab: TriggerConfigureTab) {
  // tslint:disable-next-line:triple-equals - we care if values are truthy or falsy, we're okay with non strict equality
  return COMPARABLE_PROPERTIES.some(prop => prevTab[prop] != nextTab[prop]);
}

export function tabStatusReducer(
  state: TriggerConfigureState,
  groupId: string,
  nextStatus: {
    isValid?: boolean;
    isDirty?: boolean;
    isEnabled?: boolean;
    isPending?: boolean;
  }
) {
  const prevTab = state.tabs[groupId];
  const nextTab = {
    ...prevTab,
    ...nextStatus,
  };
  // Return the original state in case of non microservice profiles where input and output mappings are not applicable
  if (!prevTab) {
    return state;
  }
  if (didStateChange(prevTab, nextTab)) {
    return {
      ...state,
      tabs: {
        ...state.tabs,
        [groupId]: nextTab,
      },
    };
  }
  return state;
}
