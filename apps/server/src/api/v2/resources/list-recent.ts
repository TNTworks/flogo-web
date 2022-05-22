import { ResourceServiceContext } from './resource-service-middleware';

export async function listRecent(ctx: ResourceServiceContext) {
  const resourceList = await ctx.resourceService.listRecent();
  ctx.body = {
    data: resourceList || [],
  };
}
