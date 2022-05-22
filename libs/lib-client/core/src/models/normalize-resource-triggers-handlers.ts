import { Trigger, Dictionary, TriggerHandler } from '../interfaces';

export function normalizeTriggersAndHandlersForResource(
  resourceId: string,
  originalTriggers: Trigger[]
) {
  const triggers: Dictionary<Trigger> = {};
  const handlers: Dictionary<TriggerHandler> = {};
  const findHandlerForAction = (handler: TriggerHandler) =>
    handler.resourceId === resourceId;
  originalTriggers.forEach(trigger => {
    triggers[trigger.id] = trigger;
    const handler = trigger.handlers.find(findHandlerForAction);
    handlers[trigger.id] = { ...handler, triggerId: trigger.id };
  });
  return { triggers, handlers };
}
