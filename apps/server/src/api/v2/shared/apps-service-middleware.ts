import { Middleware, ParameterizedContext } from 'koa';
import { RouterContext } from '@koa/router';
import { Container } from 'inversify';
import { AppsService } from '../../../modules/apps';
import { AppTriggersService } from '../../../modules/apps/triggers';

export type AppsContext = RouterContext<any, CustomContextData>;

export interface CustomContextData {
  appsService?: AppsService;
  appTriggersService?: AppTriggersService;
}

export function appsServiceMiddleware(
  container: Container
): Middleware<any, CustomContextData> {
  const appsService = container.resolve(AppsService);
  return (ctx: AppsContext, next) => {
    ctx.appsService = appsService;
    return next();
  };
}

export function appTriggersServiceMiddleware(
  container: Container
): Middleware<any, CustomContextData> {
  const appTriggerService = container.resolve(AppTriggersService);
  return (ctx: AppsContext, next) => {
    ctx.appTriggersService = appTriggerService;
    return next();
  };
}
