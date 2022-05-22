import { TriggerSchema } from '@flogo-web/core';

export interface TriggerConfigureTrigger {
  id: string;
  tabs: string[];
  isValid: boolean;
  isDirty: boolean;
  isSaving: boolean;
}

export interface TriggerConfigureTab {
  triggerId: string;
  type: TriggerConfigureTabType;
  i18nLabelKey: string;
  isValid: boolean;
  isDirty: boolean;
  isEnabled: boolean;
  isPending: boolean;
}

export interface TriggerConfigureField {
  isDirty: boolean;
  isValid: boolean;
  isEnabled: boolean;
  value: any;
  errors?: any;
  parsedMetadata?: {
    type: string;
    parsedValue: any;
    parsedDetails?: any;
  };
}

export interface TriggerConfigureFields {
  [fieldName: string]: TriggerConfigureField;
}

export enum TriggerConfigureTabType {
  Settings = 'settings',
  StreamInputMappings = 'streamInputMappings',
  StreamOutputMappings = 'streamOutputMappings',
}

export interface TriggerConfigureState {
  isOpen: boolean;
  selectedTriggerId: string;
  currentTab: TriggerConfigureTabType;
  schemas: { [triggerRef: string]: TriggerSchema };
  triggers: {
    [triggerId: string]: TriggerConfigureTrigger;
  };
  tabs: {
    [tabsId: string]: TriggerConfigureTab;
  };
  fields: {
    [fieldId: string]: TriggerConfigureFields;
  };
}
