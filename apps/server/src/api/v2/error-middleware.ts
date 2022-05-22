import isArray from 'lodash/isArray';
import { Context } from 'koa';
import { ERROR_TYPES } from '../../common/errors/error-types';
import { logger } from '../../common/logging';

export async function errorMiddleware(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (err.isOperational && err.type === ERROR_TYPES.COMMON.REST_API) {
      handleExposableApiError(err, ctx);
    } else if ((err.status === 400 || err.status === '400') && err.details) {
      // todo: this should not be a special case, exposable errors should be handled consistently
      ctx.status = err.status;
      ctx.body = err.details;
    } else {
      handleNotExposableApiError(err, ctx);
    }
  }
}

function handleNotExposableApiError(err, ctx: Context) {
  if (err.isOperational) {
    logger.info(err);
  } else {
    logger.error(err);
  }
  ctx.status = 500;
  ctx.body = {
    status: 500,
    message: 'Internal error',
  };
}

function handleExposableApiError(err, ctx: Context) {
  // todo: consider using a Boom or http-errors like interface
  ctx.status = err.details.status;
  let errors = err.details && err.details.errors;
  if (!errors) {
    errors = isArray(err.details) ? err.details : [err.details];
  }
  ctx.body = {
    errors,
  };
}
