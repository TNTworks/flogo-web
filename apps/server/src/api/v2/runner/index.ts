import * as Router from '@koa/router';
import { createInstancesRouter } from './instances';
import { createProcessesRouter } from './processes';
import { createResourceMiddleware } from '../resources/resource-service-middleware';
import { FlowRunnerCreator } from '../../../modules/engine/process/flow-runner-creator';
import { FlowExporter } from '../../../modules/transfer/export/flow-exporter';

const RouterConstructor = require('@koa/router');

const createRouter = (opts?: Router.IRouterOptions): Router =>
  new RouterConstructor(opts);

export function mountTestRunner(appRouter: Router, container) {
  const resourceServiceMiddleware = createResourceMiddleware(container);
  const runner = createRouter({ prefix: '/runner' });

  const processesRouter = createProcessesRouter(
    createRouter,
    container.resolve(FlowRunnerCreator),
    container.resolve(FlowExporter)
  );
  runner.use(processesRouter.routes(), processesRouter.allowedMethods());

  const instancesRouter = createInstancesRouter(createRouter);
  runner.use(instancesRouter.routes(), instancesRouter.allowedMethods());

  appRouter.use(resourceServiceMiddleware, runner.routes(), runner.allowedMethods());
}
