import {
  FlogoAppModel
  <% if (!pluginRef) { %> , __DEV_RESOURCE_REF_PLACEHOLDER <% } %>
} from '@flogo-web/core';
import {
  parseResourceIdFromResourceUri,
  FlogoPlugin,
  PluginServer,
  ResourceImportContext,
  HandlerImportContext,
  HandlerExportContext,
  HookContext,
  ResourceType,
} from '@flogo-web/lib-server/core';

const RESOURCE_TYPE = '<%= pluginType %>';
const RESOURCE_REF = <%= resourceRef %>;

const resourceType: ResourceType = {
  type: RESOURCE_TYPE,
  ref: RESOURCE_REF,
  import: {
    // apply transformations to resource being imported
    resource(data: any, context: ResourceImportContext) {
      return data;
    },
    // apply transformations to handler being imported
    handler(handler: any, context: HandlerImportContext) {
      // TODO: link the handler to the resource by setting the resource id
      // for example for flows:
      // handler.resourceId = parseResourceIdFromResourceUri(handler.action.settings.flowURI);
      return handler;
    },
  },
  export: {
    resource(resource) {
      return resource;
    },
    handler(handler: FlogoAppModel.NewHandler, context: HandlerExportContext) {
      return handler;
    },
  },
}

export const <%= entrySymbol %>: FlogoPlugin = {
  register(server: PluginServer) {
    // register resource type
    server.resources.addType(resourceType);

    // register resource hooks
    // this is optional, you can remove it if your plugin does not need hooks
    server.resources.useHooks({
      before: {
        create(context: HookContext) {
          if (context.resource.type === RESOURCE_TYPE) {
            console.log(`before creating resource of type ${context.resource.type}`);
          } else {
            console.log(`ignoring resources of type ${context.resource.type}`);
          }
        },
      },
    });
  },
};
