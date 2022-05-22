import { FlogoAppModel, TriggerSchema } from '@flogo-web/core';
import {
  TriggerHandler,
  Trigger,
  InstalledFunctionSchema,
} from 'libs/lib-client/core/src/interfaces';

export interface ConfiguratorStatus {
  disableSave?: boolean;
  isOpen?: boolean;
  triggers?: TriggerStatus[];
  selectedTriggerId?: string;
}

export interface TriggerStatus {
  id?: string;
  isValid?: boolean;
  isDirty?: boolean;
  name?: string;
}

export interface TriggerState {
  appId: string;
  schema: TriggerSchema;
  handler: TriggerHandler;
  trigger: Trigger;
  // todo: define
  fields: any;
  appProperties?: FlogoAppModel.AppProperty[];
  functions: InstalledFunctionSchema[];
}
