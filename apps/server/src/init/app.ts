import { createServer, Server } from 'http';
import { Container } from 'inversify';
import * as Koa from 'koa';
import 'koa-body';
import { logger } from '../common/logging';
import { ERROR_TYPES, ErrorManager } from '../common/errors';
import { mountRestApi } from '../api';
import * as path from 'path';

const KoaApp = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const serveStatic = require('koa-static');
const bodyParser = require('koa-body');
const compress = require('koa-compress');
const send = require('koa-send');

export interface ServerConfig {
  port: string;
  staticPath: string;
  logsRoot: string;
  uploadsRoot: string;
  container: Container;
}

export async function createApp({
  port,
  staticPath,
  logsRoot,
  uploadsRoot,
  container,
}: ServerConfig) {
  const app: Koa = new KoaApp();
  app.on('error', errorLogger);
  app.use(
    cors({
      origin: '*',
      exposeHeaders: ['Content-Disposition'],
    })
  );
  // uncomment to log all requests
  // app.use(requestLogger());
  app.use(stripTrailingSlash());
  app.use(compressor());

  const router = initRouter(logsRoot, uploadsRoot, container);
  app.use(router.routes()).use(router.allowedMethods());

  app.use(serveStatic(staticPath, { defer: true }));

  const server = createServer(app.callback());
  await listenAndWaitReady(server, port);
  logger.info('start web server done.');
  return server;
}

function listenAndWaitReady(server: Server, port: string) {
  const resolver = (success, fail) => {
    server.on('listening', success);
    server.on('error', fail);
  };
  server.listen(port);
  return new Promise(resolver);
}

function errorLogger(): Koa.Middleware {
  return function(err) {
    // tslint:disable-next-line:triple-equals - non-strict check is okay
    if (401 != err.status && 404 != err.status) {
      logger.error(err);
    }
  };
}

function initRouter(logsRoot: string, uploadsRoot: string, container: Container) {
  const router = new Router();
  router.use(
    bodyParser({
      multipart: true,
      formidable: {
        uploadDir: uploadsRoot,
        onFileBegin: (name, file) => {
          file.path = path.join(uploadsRoot, name);
        },
      },
      onError() {
        throw ErrorManager.createRestError('Body parse error', {
          type: ERROR_TYPES.COMMON.BAD_SYNTAX,
        });
      },
    })
  );
  mountRestApi(router, container);
  const sendLog = logName => ctx => send(ctx, logName, { root: logsRoot });
  router.get('/_logs/app.log', sendLog('app.log'));
  router.get('/_logs/engine.log', sendLog('engine.log'));
  return router;
}

const REST_API_ROUTE = /\/[^\/]+\.[^.\/]+$/i;
function stripTrailingSlash(): Koa.Middleware {
  return function stripTrailingSlashMiddleware(ctx: Koa.Context, next) {
    let requestPath = ctx.request.path;
    requestPath = requestPath.endsWith('/')
      ? requestPath.substring(0, requestPath.length - 1)
      : requestPath;
    const isRestApiRoute =
      !REST_API_ROUTE.test(requestPath) &&
      requestPath.toLowerCase().search('/api/') === -1;
    if (isRestApiRoute) {
      ctx.request.path = '/';
    }
    return next();
  };
}

function requestLogger(): Koa.Middleware {
  return async function requestLoggerMiddleware(ctx, next) {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    logger.verbose('%s %s - %s', ctx.method, ctx.url, ms);
    logger.verbose(ctx.body);
  };
}

function compressor(): Koa.Middleware {
  return compress({
    filter: content_type => /text/i.test(content_type),
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH,
  });
}
