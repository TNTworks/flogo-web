import { defaults, pick } from 'lodash';
import { injectable, inject } from 'inversify';
import { Collection } from 'lokijs';
import { App, Trigger, Handler } from '@flogo-web/core';
import { TOKENS } from '../../core';
import { ErrorManager, ERROR_TYPES } from '../../common/errors';
import { Validator } from './validator';
import { ISONow } from '../../common/utils';

const EDITABLE_FIELDS = ['settings', 'outputs', 'actionMappings'];

@injectable()
export class HandlersService {
  constructor(@inject(TOKENS.AppsDb) private appsDb: Collection<App>) {}

  async save(triggerId, resourceId, handlerData) {
    if (!triggerId || !resourceId) {
      throw new TypeError('Params triggerId and resourceId are required');
    }

    const [app] = this.appsDb
      .chain()
      .find(
        <LokiQuery<any>>{ 'triggers.id': triggerId, 'resources.id': resourceId },
        true
      )
      .data();

    if (!app) {
      throw ErrorManager.makeError('App not found', {
        type: ERROR_TYPES.COMMON.NOT_FOUND,
      });
    }

    const errors = Validator.validateHandler(handlerData);
    if (errors) {
      throw ErrorManager.createValidationError('Validation error', errors);
    }
    let handler = cleanInput(handlerData, EDITABLE_FIELDS);

    const triggerIndex = app.triggers.findIndex(t => t.id === triggerId);
    const trigger = app.triggers[triggerIndex];

    const now = ISONow();

    const existingHandlerIndex = trigger.handlers.findIndex(
      h => h.resourceId === resourceId
    );
    if (existingHandlerIndex >= 0) {
      const existingHandler = trigger.handlers[existingHandlerIndex];
      defaults(handler, existingHandler);
      handler.updatedAt = now;
      trigger.handlers[existingHandlerIndex] = handler as Handler;
    } else {
      handler = defaults(handler, {
        resourceId,
        createdAt: now,
        updatedAt: null,
        settings: {},
        outputs: {},
        actionMappings: {
          input: {},
          output: {},
        },
      });
      trigger.handlers.push(handler as Handler);
    }

    this.appsDb.update(app);
    return this.findOne(triggerId, resourceId);
  }

  async findOne(triggerId, resourceId) {
    const [app] = this.appsDb
      .chain()
      .find(<LokiQuery<any>>{ 'triggers.id': triggerId }, true)
      .data();
    if (!app) {
      return null;
    }

    const trigger = app.triggers.find(t => t.id === triggerId);
    const storedHandler = trigger.handlers.find(h => h.resourceId === resourceId);
    let result = null;
    if (storedHandler) {
      result = {
        ...storedHandler,
        appId: app.id,
        triggerId: trigger.id,
      };
    }
    return result;
  }

  async list(triggerId) {
    const [trigger] = this.appsDb
      .chain()
      .find(<LokiQuery<any>>{ 'triggers.id': triggerId }, true)
      .map<Trigger>(app => app.triggers.find(t => t.id === triggerId))
      .data();
    return trigger && trigger.handlers ? trigger.handlers : [];
  }

  async remove(triggerId, resourceId) {
    if (!triggerId || !resourceId) {
      throw new TypeError('Params triggerId and resourceId are required');
    }
    const [app] = this.appsDb
      .chain()
      .find(
        <LokiQuery<any>>{
          'triggers.id': triggerId,
          'resources.id': resourceId,
        },
        true
      )
      .data();
    if (!app) {
      return false;
    }

    const trigger = app.triggers.find(t => t.id === triggerId);
    trigger.handlers = trigger.handlers.filter(h => h.resourceId !== resourceId);
    this.appsDb.update(app);
    return true;
  }

  async removeByResourceId(resourceId) {
    let [app] = this.appsDb
      .chain()
      .find(
        <LokiQuery<any>>{
          'triggers.handlers.resourceId': resourceId,
        },
        true
      )
      .data();

    if (!app) {
      return false;
    }

    app = removeHandlerWhereResourceId(app, resourceId);
    this.appsDb.update(app);

    return true;
  }
}

function removeHandlerWhereResourceId(
  app: App & LokiObj,
  resourceIdx: string
): App & LokiObj {
  const isHandlerToRemove = (handler: Handler) => handler.resourceId === resourceIdx;
  for (const trigger of app.triggers) {
    const handlerToRemoveIndex = trigger.handlers.findIndex(isHandlerToRemove);
    if (handlerToRemoveIndex > -1) {
      trigger.handlers.splice(handlerToRemoveIndex, 1);
    }
  }
  return app;
}

function cleanInput(trigger, fields) {
  const cleanTrigger = pick(trigger, fields);
  if (cleanTrigger.name) {
    cleanTrigger.name = cleanTrigger.name.trim();
  }
  return cleanTrigger;
}
