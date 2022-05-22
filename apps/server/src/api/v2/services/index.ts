import { format as formatUrl } from 'url';
import * as Koa from 'koa';
import * as Router from '@koa/router';
const RouterConstructor = require('@koa/router');
const request = require('got');

import { getServiceRegistry, getConfigSummary } from './config';
const DEFAULT_TIMEOUT = 4000;

export function mountServices(appRouter: Router) {
  const services = new RouterConstructor({ prefix: '/services' }) as Router;
  services.get('/', (ctx: Koa.Context, next) => {
    ctx.body = getConfigSummary();
  });
  services.get('/:serviceName/health', async (ctx: Koa.Context) => {
    const healthUrl = getServiceHealthUrl(ctx.params.serviceName);
    if (!healthUrl) {
      ctx.status = 404;
      ctx.body = {
        error: 'Unknown service name',
      };
      return;
    }
    try {
      const result = await request(healthUrl, { timeout: DEFAULT_TIMEOUT });
      ctx.body = { data: result.body };
    } catch (e) {
      ctx.status = 502;
      ctx.body = {
        serviceStatus: e.response && e.response.status,
        code: e.code,
        body: e.response && e.response.body,
      };
    }
  });
  appRouter.use(services.routes(), services.allowedMethods());
}

function getServiceHealthUrl(serviceName) {
  const registry = getServiceRegistry();
  const service = registry[serviceName];
  if (!service) {
    return null;
  }
  return formatUrl({
    protocol: service.protocol,
    hostname: service.host,
    port: service.port,
    pathname: service.testPath,
  });
}
