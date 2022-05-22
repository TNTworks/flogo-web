import { Trigger } from '@flogo-web/core';
import { ResourceWithPlugin } from './resource-with-plugin';

export interface FlowGroup {
  trigger: Trigger | null;
  flows: ResourceWithPlugin[];
}
