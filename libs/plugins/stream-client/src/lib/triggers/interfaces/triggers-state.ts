import { RenderableTrigger } from '@flogo-web/lib-client/core';
export interface TriggersState {
  appId: string;
  actionId: string;
  triggers: RenderableTrigger[];
}
