import { Trigger } from '@flogo-web/core';
import { ResourceWithPlugin } from './resource-with-plugin';

export interface TriggerGroup {
  triggers: Trigger[] | null;
  flow: ResourceWithPlugin;
}
