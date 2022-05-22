import { injectable } from 'inversify';

import { RESOURCE_TYPE as FLOW_RESOURCE_TYPE } from '@flogo-web/plugins/flow-server';
import {
  ExportActionAgent,
  Resource,
  ResourceExportContext,
} from '@flogo-web/lib-server/core';

import { ResourceService } from '../../resources';
import { AllContribsService } from '../../all-contribs';
import { ResourcePluginRegistry } from '../../../extension';

@injectable()
export class FlowExporter {
  constructor(
    private resourceService: ResourceService,
    private pluginRegistry: ResourcePluginRegistry,
    private allContribsService: AllContribsService
  ) {}

  async export(resourceId) {
    const resource = await this.resourceService.findOne(resourceId);
    const contributions = await this.allContribsService.allByRef();
    const resourceExporter = this.pluginRegistry.resourceTypes.exporter(
      FLOW_RESOURCE_TYPE
    );
    /*
     * Creating a custom context to override ref agent and nullify action agent & resourceIdReconciler
     * as exporting a resource required for flow test runner doesn't depend on those.
     * */
    const exportContext: ResourceExportContext = {
      contributions,
      resourceIdReconciler: new Map<string, Resource>(),
      refAgent: {
        getAliasRef: (contribType: string, ref: string) => ref,
        registerFunctionName: () => {},
      },
      actionAgent: {} as ExportActionAgent,
    };
    return resourceExporter.resource(resource, exportContext);
  }
}
