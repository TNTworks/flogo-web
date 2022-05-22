import { ErrorManager, RestError, ERROR_TYPES } from '../../../common/errors';
import { ResourceServiceContext } from './resource-service-middleware';

export async function createResource(ctx: ResourceServiceContext) {
  const appId = ctx.params.appId;
  const body = ctx.request.body;
  try {
    const resource = await ctx.resourceService.create(appId, body);
    ctx.body = {
      data: resource,
    };
  } catch (error) {
    handleError(error);
  }
}
function handleError(error: any) {
  if (error.isOperational && error.type === ERROR_TYPES.COMMON.VALIDATION) {
    throw new RestError('Validation error in /resource create resource', 400, {
      title: 'Validation error',
      detail: 'There were one or more validation problems',
      meta: error.details.errors,
    });
  } else if (error.type === ERROR_TYPES.COMMON.NOT_FOUND) {
    throw ErrorManager.createRestNotFoundError('Application not found', {
      title: 'Application not found',
      detail: 'No application with the specified id',
    });
  }
  throw error;
}
