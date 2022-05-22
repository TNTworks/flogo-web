import { Dictionary, TriggerHandler } from '@flogo-web/lib-client/core';
import { Trigger, RenderableTrigger } from './../interfaces';

export function triggersToRenderableTriggers(
  handlers: Dictionary<TriggerHandler>,
  triggers: Dictionary<Trigger>
): RenderableTrigger[] {
  return Object.values(handlers).map(handler => ({
    ...triggers[handler.triggerId],
    handler,
  }));
}
