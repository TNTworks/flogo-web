import { FlogoAppModel, Resource, ContributionType } from '@flogo-web/core';
import {
  FlogoPlugin,
  PluginServer,
  ResourceImportContext,
  HandlerImportContext,
  HandlerExportContext,
  ResourceExportContext,
} from '@flogo-web/lib-server/core';
import { StreamData } from '@flogo-web/plugins/stream-core';

import { exportStreamResource, registerAction } from './export';
import { importHandler, importStreamResource } from './import';
import { RESOURCE_TYPE } from './constants';
import { streamHooks } from './hooks';

const RESOURCE_REF = 'github.com/project-flogo/stream';

export const streamPlugin: FlogoPlugin = {
  register(server: PluginServer) {
    // register resource type
    server.resources.addType({
      type: RESOURCE_TYPE,
      resourceType: 'stream',
      additionalResourceTypes: ['pipeline'],
      ref: RESOURCE_REF,
      import: {
        resource(data: Resource<StreamData>, context: ResourceImportContext) {
          return importStreamResource(data, context);
        },
        handler(handler: FlogoAppModel.Handler, context: HandlerImportContext) {
          return importHandler(handler, context);
        },
      },
      export: {
        resource(resource: Resource<StreamData>, context: ResourceExportContext) {
          const ref = context.refAgent.getAliasRef(ContributionType.Action, RESOURCE_REF);
          registerAction(context.actionAgent, ref, resource.id, resource.metadata);
          return exportStreamResource(resource, context);
        },
        handler(handler: FlogoAppModel.NewHandler, context: HandlerExportContext) {
          handler.action = {
            ...handler.action,
            id: context.actionAgent.getActionId(context.resource.id),
            settings: undefined,
            ref: undefined,
          };
          return handler;
        },
      },
    });

    // registering create and update hooks
    server.resources.useHooks(streamHooks);
  },
};
