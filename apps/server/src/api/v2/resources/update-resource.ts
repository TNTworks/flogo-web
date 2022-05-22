import { ErrorManager, RestError, ERROR_TYPES } from '../../../common/errors';
import { ResourceServiceContext } from './resource-service-middleware';

export async function updateResource(ctx: ResourceServiceContext, next) {
  const resourceId = ctx.params.resourceId;
  const data = ctx.request.body || {};
  try {
    const app = await ctx.resourceService.update(resourceId, data);
    ctx.body = {
      data: app,
    };
  } catch (error) {
    handleError(error, resourceId);
  }
}

function handleError(error, resourceId) {
  if (error.isOperational) {
    if (error.type === ERROR_TYPES.COMMON.VALIDATION) {
      throw new RestError('Validation error in /resource updateResource', 400, {
        title: 'Validation error',
        detail: 'There were one or more validation problems',
        meta: error.details.errors,
      });
    } else if (error.type === ERROR_TYPES.COMMON.NOT_FOUND) {
      throw ErrorManager.createRestNotFoundError('Resource not found', {
        title: 'Resource not found',
        detail: 'No resource with the specified id',
        value: resourceId,
      });
    }
  }
  throw error;
}
