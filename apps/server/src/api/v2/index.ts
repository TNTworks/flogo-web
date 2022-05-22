import { Container } from 'inversify';
import * as Router from '@koa/router';
const RouterConstructor = require('@koa/router');

import { config } from '../../config/app-config';
import { flushAndCloseDb } from '../../common/db';
import { errorMiddleware } from './error-middleware';
import { apps } from './apps';
import { triggers } from './triggers';
import { contribs as microserviceContribs } from './contribs/microservices';
import { handlers } from './handlers';
import { mountServices } from './services';
import { mountTestRunner } from './runner';
import { mountResourceRoutes } from './resources';
import { fileUpload } from './file-upload';

export function createRouter(container: Container): Router {
  const router = new RouterConstructor({
    prefix: config.app.basePathV2,
  });
  router.use(errorMiddleware);
  apps(router, container);
  triggers(router, container);
  microserviceContribs(router, container);
  handlers(router, container);
  mountResourceRoutes(router, container);
  mountServices(router);
  mountTestRunner(router, container);
  fileUpload(router);

  router.get('/_/features', context => {
    context.body = config.features;
  });

  router.post('/_/db\\:flush', async context => {
    await flushAndCloseDb();
    context.body = { status: 'okay' };
  });

  return router;
}
