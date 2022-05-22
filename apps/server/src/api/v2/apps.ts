import { Container } from 'inversify';
import 'koa-body';

import Router from '@koa/router';

import { ERROR_TYPES, ErrorManager } from '../../common/errors';
import { exportApp } from './apps/export';
import { buildApp } from './apps/build';
import {
  appsServiceMiddleware,
  AppsContext,
  CustomContextData as AppsCustonContextData,
} from './shared/apps-service-middleware';

export function apps(router: Router, container: Container) {
  const appsRouter = new Router<any, AppsCustonContextData>();
  appsRouter
    .use(appsServiceMiddleware(container))
    .get('/', listApps)
    .post('/', createApp)
    .post('\\:import', importApp)
    // ex. /apps/zA45E:export
    // needs to be registered before .get('/:appId')
    .get('/:appId\\:export', exportApp)
    .get('/:appId', getApp)
    .get('/:appId/build', buildApp)
    .patch('/:appId', updateApp)
    .del('/:appId', deleteApp);
  router.use('/apps', appsRouter.routes(), appsRouter.allowedMethods());
}

async function listApps(ctx: AppsContext) {
  const searchTerms: { name?: string } = {};
  const filterName = ctx.request.query['filter[name]'];
  if (filterName) {
    searchTerms.name = filterName;
  }

  const foundApps = await ctx.appsService.find(searchTerms);
  ctx.body = {
    data: foundApps || [],
  };
}

async function createApp(ctx: AppsContext) {
  const body = ctx.request.body;
  try {
    const app = await ctx.appsService.create(body);
    ctx.body = {
      data: app,
    };
  } catch (error) {
    if (error.isOperational && error.type === ERROR_TYPES.COMMON.VALIDATION) {
      throw ErrorManager.createRestError('Validation error in /apps createApp', {
        status: 400,
        title: 'Validation error',
        detail: 'There were one or more validation problems',
        meta: { details: error.details.errors },
      });
    }
    throw error;
  }
}

async function getApp(ctx: AppsContext) {
  const appId = ctx.params.appId;

  const app = await ctx.appsService.findOne(appId, { withFlows: 'short' });

  if (!app) {
    throw ErrorManager.createRestNotFoundError('Application not found', {
      title: 'Application not found',
      detail: 'No application with the specified id',
    });
  }

  ctx.body = {
    data: app,
  };
}

async function updateApp(ctx: AppsContext) {
  try {
    const appId = ctx.params.appId;
    const data = ctx.request.body || {};

    const app = await ctx.appsService.update(appId, data);

    ctx.body = {
      data: app,
    };
  } catch (error) {
    if (error.isOperational) {
      if (error.type === ERROR_TYPES.COMMON.VALIDATION) {
        throw ErrorManager.createRestError('Validation error in /apps getApp', {
          status: 400,
          title: 'Validation error',
          detail: 'There were one or more validation problems',
          meta: { details: error.details.errors },
        });
      } else if (error.type === ERROR_TYPES.COMMON.NOT_FOUND) {
        throw ErrorManager.createRestNotFoundError('Application not found', {
          title: 'Application not found',
          detail: 'No application with the specified id',
        });
      }
    }
    throw error;
  }
}

async function deleteApp(ctx: AppsContext) {
  const appId = ctx.params.appId;
  const removed = await ctx.appsService.remove(appId);

  if (!removed) {
    throw ErrorManager.createRestNotFoundError('Application not found', {
      title: 'Application not found',
      detail: 'No application with the specified id',
    });
  }

  ctx.status = 204;
}

async function importApp(ctx: AppsContext) {
  try {
    ctx.body = await ctx.appsService.importApp(ctx.request.body);
  } catch (error) {
    if (error.isOperational && error.type === ERROR_TYPES.COMMON.VALIDATION) {
      throw ErrorManager.createRestError('Validation error in /apps importApp', {
        status: 400,
        title: 'Validation error',
        detail: 'There were one or more validation problems',
        meta: { details: error.details.errors },
      });
    }
    throw error;
  }
}
