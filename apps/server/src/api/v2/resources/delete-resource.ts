import { ErrorManager } from '../../../common/errors';
import { ResourceServiceContext } from './resource-service-middleware';

export async function deleteResource(ctx: ResourceServiceContext) {
  const resourceId = ctx.params.resourceId;
  const removed = await ctx.resourceService.remove(resourceId);
  if (!removed) {
    throw ErrorManager.createRestNotFoundError('Resource not found', {
      title: 'Resource not found',
      detail: 'No resource with the specified id',
      value: resourceId,
    });
  }
  ctx.status = 204;
}
