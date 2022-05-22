import { TriggerConfigureTabType } from '../../../interfaces';

const SETTINGS_TAB: { type: TriggerConfigureTabType; i18nKey: string } = {
  type: TriggerConfigureTabType.Settings,
  i18nKey: 'STREAMS.TRIGGER-CONFIGURATOR:SETTINGS',
};

const INPUT_MAPPINGS_TAB: { type: TriggerConfigureTabType; i18nKey: string } = {
  type: TriggerConfigureTabType.StreamInputMappings,
  i18nKey: 'STREAMS.TRIGGER-CONFIGURATOR:STREAM-INPUTS',
};

const OUTPUT_MAPPINGS_TAB: {
  type: TriggerConfigureTabType;
  i18nKey: string;
} = {
  type: TriggerConfigureTabType.StreamOutputMappings,
  i18nKey: 'STREAMS.TRIGGER-CONFIGURATOR:STREAM-OUTPUTS',
};

export const getMicroServiceTabs = () => [
  { ...SETTINGS_TAB },
  { ...INPUT_MAPPINGS_TAB },
  { ...OUTPUT_MAPPINGS_TAB },
];
