import { ErrorManager } from '../../../common/errors';
import { ResourceServiceContext } from './resource-service-middleware';

export async function getResource(ctx: ResourceServiceContext) {
  const resourceId = ctx.params.resourceId;
  const resource = await ctx.resourceService.findOne(resourceId);
  if (!resource) {
    throw ErrorManager.createRestNotFoundError('Resource not found', {
      title: 'Resource not found',
      detail: 'No resource with the specified id',
      value: resourceId,
    });
  }
  ctx.body = {
    data: resource,
  };
}
