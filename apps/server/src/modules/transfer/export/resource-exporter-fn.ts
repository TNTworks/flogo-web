import { Resource, FlogoAppModel } from '@flogo-web/core';
import { ResourceExportContext, HandlerExportContext } from '@flogo-web/lib-server/core';

export type ResourceExporterFn = (
  resource: Resource,
  context: ResourceExportContext
) => FlogoAppModel.Resource;

export type HandlerExporterFn = (
  resourceType: string,
  handler: FlogoAppModel.Handler,
  context: HandlerExportContext
) => FlogoAppModel.NewHandler;
