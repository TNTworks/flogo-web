import { Container } from 'inversify';
import { RouterContext } from '@koa/router';
import { ResourceService } from '../../../modules/resources';
import { IMiddleware as RouterMiddleware } from '@koa/router';

export type ResourceServiceContext = RouterContext<any, ResourceServiceContextData>;

export interface ResourceServiceContextData {
  resourceService: ResourceService;
}

export function createResourceMiddleware(
  container: Container
): RouterMiddleware<any, ResourceServiceContextData> {
  const resourceService = container.resolve(ResourceService);
  return (ctx: ResourceServiceContext, next) => {
    ctx.resourceService = resourceService;
    return next();
  };
}
