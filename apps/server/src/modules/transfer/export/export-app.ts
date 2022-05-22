import { cloneDeep } from 'lodash';
import { App, ContributionSchema } from '@flogo-web/core';
import { ResourceExporter, ResourceConfiguration } from '@flogo-web/lib-server/core';

import { isValidApplicationType } from '../../../common/utils';
import { AppFormatter } from './app-formatter';
import { Exporter } from './exporter';
import { UniqueIdAgent } from './utils/unique-id-agent';

export interface ExportAppOptions {
  isFullExportMode?: boolean;
  selectResources?: string[];
}

export function exportApp(
  app: App,
  resolveExporterFn: (resourceType: string) => ResourceExporter,
  activitySchemas: Map<string, ContributionSchema>,
  getResourceConfig: (resourceType: string) => ResourceConfiguration,
  options: ExportAppOptions = {}
) {
  if (!isValidApplicationType(app.type)) {
    throw new Error('Can only export microservice applications');
  }
  const formatter = new AppFormatter(
    activitySchemas,
    getResourceConfig,
    createExportResolver(resolveExporterFn)
  );
  const { isFullExportMode = true, selectResources = [] } = options;
  const exporter = new Exporter(
    isFullExportMode,
    formatter,
    new UniqueIdAgent(),
    getResourceConfig
  );
  return exporter.export(cloneDeep(app), selectResources);
}

function getExporterForType(
  resolveResourceExporter: (resourceType: string) => ResourceExporter
) {
  return (resourceType: string): ResourceExporter => {
    const resourceExporter = resolveResourceExporter(resourceType);
    if (!resourceExporter) {
      // todo: error type
      throw new Error(
        `Cannot process resource of type "${resourceType}", no plugin registered for such type.`
      );
    }
    return resourceExporter;
  };
}

function createExportResolver(
  resolveResourceExporter: (resourceType: string) => ResourceExporter
) {
  const resolvePluginForType = getExporterForType(resolveResourceExporter);
  return {
    resource(resource, context) {
      return resolvePluginForType(resource.type).resource(resource, context);
    },
    handler(resourceType, handler, context) {
      return resolvePluginForType(resourceType).handler(handler, context);
    },
  };
}
