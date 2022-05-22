import { Context } from 'koa';
import { ResourceServiceContext } from './resource-service-middleware';

export async function listResources(ctx: ResourceServiceContext, next) {
  const appId = ctx.params.appId;
  const options = getOptions(ctx);
  const resourceList = await ctx.resourceService.list(appId, options);
  ctx.body = {
    data: resourceList || [],
  };
}

function getOptions(ctx: Context) {
  const options: {
    filter?: {
      by: string;
      value: any;
    };
    project?: any;
  } = {};
  const filterName = ctx.request.query['filter[name]'];
  const filterId = ctx.request.query['filter[id]'];
  const getFields = ctx.request.query['fields'];
  if (filterName || filterId) {
    const filter = (options.filter = {} as any);
    if (filterName) {
      filter.by = 'name';
      filter.value = filterName;
    } else if (filterId) {
      filter.by = 'id';
      filter.value = filterId.split(',');
    }
  }
  if (getFields) {
    options.project = getFields.split(',');
  }
  return options;
}
