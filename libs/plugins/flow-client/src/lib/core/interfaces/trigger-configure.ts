import { TriggerSchema } from '@flogo-web/core';

export interface TriggerConfigureSettings {
  groupId: 'settings';
  id: string;
  name: string;
  description: string;
  trigger: {
    [id: string]: any;
  };
  handler: {
    [id: string]: any;
  };
}

export interface TriggerConfigureMappings {
  groupId:
    | TriggerConfigureTabType.FlowInputMappings
    | TriggerConfigureTabType.FlowOutputMappings;
  mappings: { [field: string]: string };
}

export interface TriggerConfigureGroup {
  id: string;
  settings?: TriggerConfigureSettings;
  inputMappings?: TriggerConfigureMappings;
  outputMappings?: TriggerConfigureMappings;
}

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
  FlowInputMappings = 'flowInputMappings',
  FlowOutputMappings = 'flowOutputMappings',
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
