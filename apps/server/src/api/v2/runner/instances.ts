import { Context, Middleware } from 'koa';
import * as Router from '@koa/router';
import { Services } from './services';

export function createInstancesRouter(
  createRouter: (opts: Router.IRouterOptions) => Router
): Router {
  const instances = createRouter({ prefix: '/instances/:instanceId' });
  instances.use(queryInstanceService);
  instances.get('/status', subEndpoint('/status'));
  instances.get('/steps', subEndpoint('/steps'));
  instances.get(
    '/snapshot/:snapshotId',
    subEndpoint((ctx: Context) => `/snapshot/${ctx.params.snapshotId}`)
  );
  return instances;
}

export function subEndpoint(
  endpointPath: ((ctx: Context) => string) | string
): Middleware {
  return (ctx: Context) => {
    const path = endpointPath instanceof Function ? endpointPath(ctx) : endpointPath;
    if (path) {
      ctx.state.stateServiceSubpath = path;
    }
  };
}

export async function queryInstanceService(ctx: Context, next) {
  const stateServer = Services.stateServer;
  await next();
  let endpoint = `/instances/${ctx.params.instanceId}`;
  if (ctx.state.stateServiceSubpath) {
    endpoint += ctx.state.stateServiceSubpath;
  }
  const response = await stateServer.client.get(endpoint);
  ctx.body = response.body;
}
