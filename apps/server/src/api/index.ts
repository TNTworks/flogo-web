import * as Router from '@koa/router';
import { Container } from 'inversify';
import { createRouter as createV2Router } from './v2';

export function mountRestApi(appRouter: Router, container: Container) {
  const v2Router = createV2Router(container);
  appRouter.use(v2Router.routes(), v2Router.allowedMethods());
}
