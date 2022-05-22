import { FlogoAppModel } from '@flogo-web/core';
import {
  ResourceImportContext,
  ResourceExportContext,
  PluginServer,
  Resource,
  FlogoPlugin,
  HandlerImportContext,
} from '@flogo-web/lib-server/core';
import { FlowData } from '@flogo-web/plugins/flow-core';

import { createActionImporter, importHandler } from './import';
import { exportFlow, exportHandler } from './export';
import { resourceHooks } from './hooks';
import { FLOW_REF, RESOURCE_TYPE } from './constants';

const resourceType = {
  type: RESOURCE_TYPE,
  resourceType: RESOURCE_TYPE,
  ref: FLOW_REF,
  import: {
    resource(data, context: ResourceImportContext) {
      const importer = createActionImporter();
      return importer.importAction(data, context);
    },
    handler(handler, context: HandlerImportContext) {
      return importHandler(handler, context);
    },
  },
  export: {
    resource(resource: Resource<FlowData>, context: ResourceExportContext) {
      return exportFlow(resource, context);
    },
    handler(handler: FlogoAppModel.NewHandler, context) {
      return exportHandler(handler, context);
    },
  },
};

export const flowPlugin: FlogoPlugin = {
  register(server: PluginServer) {
    server.resources.addType(resourceType);
    server.resources.useHooks(resourceHooks);
  },
};
