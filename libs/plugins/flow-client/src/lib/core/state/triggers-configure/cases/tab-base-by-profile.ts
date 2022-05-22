import { TriggerConfigureTabType } from '../../../interfaces';

const SETTINGS_TAB: { type: TriggerConfigureTabType; i18nKey: string } = {
  type: TriggerConfigureTabType.Settings,
  i18nKey: 'TRIGGER-CONFIGURATOR:SETTINGS',
};

const INPUT_MAPPINGS_TAB: { type: TriggerConfigureTabType; i18nKey: string } = {
  type: TriggerConfigureTabType.FlowInputMappings,
  i18nKey: 'TRIGGER-CONFIGURATOR:FLOW-INPUTS',
};

const OUTPUT_MAPPINGS_TAB: {
  type: TriggerConfigureTabType;
  i18nKey: string;
} = {
  type: TriggerConfigureTabType.FlowOutputMappings,
  i18nKey: 'TRIGGER-CONFIGURATOR:FLOW-OUTPUTS',
};

export const getMicroServiceTabs = () => [
  { ...SETTINGS_TAB },
  { ...INPUT_MAPPINGS_TAB },
  { ...OUTPUT_MAPPINGS_TAB },
];
