import { TriggerHandler } from '@flogo-web/lib-client/core';

export interface Trigger {
  id: string;
  appId?: string;
  name: string;
  ref: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string | null;
  settings: any;
  handlers: TriggerHandler[];
  handler?: TriggerHandler;
}
