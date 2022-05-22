import { Context } from 'koa';
import * as Router from '@koa/router';
const RouterClass = require('@koa/router');

import { HandlersService } from '../../modules/apps/handlers-service';
import { ErrorManager, ERROR_TYPES } from '../../common/errors';

let handlersService: HandlersService;
export function handlers(router: Router, container) {
  handlersService = container.resolve(HandlersService);
  const handlersRouter: Router = new RouterClass({
    prefix: '/triggers/:triggerId/handlers',
  });
  handlersRouter
    .get(`/`, listHandlers)
    .get(`/:actionId`, getHandler)
    .put(`/:actionId`, saveHandler)
    .del(`/:actionId`, deleteHandler);
  router.use(handlersRouter.routes(), handlersRouter.allowedMethods());
}

async function listHandlers(ctx: Context) {
  const triggerId = ctx.params.triggerId;
  const handlerList = await handlersService.list(triggerId);
  ctx.body = {
    data: handlerList || [],
  };
}

async function saveHandler(ctx: Context) {
  const triggerId = ctx.params.triggerId;
  const actionId = ctx.params.actionId;
  const body = ctx.request.body;
  try {
    const handler = await handlersService.save(triggerId, actionId, body);
    ctx.body = {
      data: handler,
    };
  } catch (error) {
    if (error.isOperational && error.type === ERROR_TYPES.COMMON.VALIDATION) {
      throw ErrorManager.createRestError('Validation error in /handlers create handler', {
        status: 400,
        title: 'Validation error',
        detail: 'There were one or more validation problems',
        meta: error.details.errors,
      });
    } else if (error.type === ERROR_TYPES.COMMON.NOT_FOUND) {
      throw ErrorManager.createRestNotFoundError('Action or trigger not found', {
        title: 'Action or trigger not found',
        detail:
          'Action or trigger not found. Make sure they exist and they are registered in the same app.',
      });
    }
    throw error;
  }
}

async function getHandler(ctx: Context) {
  const triggerId = ctx.params.triggerId;
  const actionId = ctx.params.actionId;

  const handler = await handlersService.findOne(triggerId, actionId);

  if (!handler) {
    throw ErrorManager.createRestNotFoundError('Handler not found', {
      title: 'Handler not found',
      detail: 'No handler with the specified ids',
      value: {
        triggerId,
        actionId,
      },
    });
  }

  ctx.body = {
    data: handler,
  };
}

async function deleteHandler(ctx: Context) {
  const triggerId = ctx.params.triggerId;
  const actionId = ctx.params.actionId;
  const removed = await handlersService.remove(triggerId, actionId);

  if (!removed) {
    throw ErrorManager.createRestNotFoundError('Handler not found', {
      title: 'Handler not found',
      detail: 'No handler with the specified ids',
      value: {
        actionId,
        triggerId,
      },
    });
  }

  ctx.status = 204;
}
