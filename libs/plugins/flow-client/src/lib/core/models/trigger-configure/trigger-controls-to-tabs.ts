import { get } from 'lodash';
const i18nTabKeys = {
  settings: 'TRIGGER-CONFIGURATOR:SETTINGS',
  flowInputMappings: 'TRIGGER-CONFIGURATOR:FLOW-INPUTS',
  flowOutputMappings: 'TRIGGER-CONFIGURATOR:FLOW-OUTPUTS',
};

export function triggerControlsToTabs(controls) {
  const pathToGroupId = 'value.groupId';
  return Object.values(controls)
    .filter(control => i18nTabKeys[get(control, pathToGroupId)])
    .map(controlGroupState => {
      const groupId = get(controlGroupState, pathToGroupId);
      return {
        id: groupId,
        state: controlGroupState,
        i18nKey: i18nTabKeys[groupId],
      };
    });
}
