import { InjectionToken } from '@angular/core';
import { TriggerStatus } from '../interfaces';

export const TRIGGER_STATUS_TOKEN = new InjectionToken<TriggerStatus>(
  'flogo/triggers/configurator/trigger-status'
);
