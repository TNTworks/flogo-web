import { ResourceHooks } from './resource-hooks';
import { ResourceImporter } from './resource-importer';
import { ResourceExporter } from './resource-exporter';

export interface FlogoPlugin {
  register(server: PluginServer);
}

export interface PluginServer {
  resources: ResourceExtensionRegistrar;
}

export interface ResourceExtensionRegistrar {
  addType(type: ResourceType);
  useHooks(resourceHooks: ResourceHooks);
}

export interface ResourceType<TResourceData = unknown> {
  type: string;
  ref: string;
  resourceType: string;
  additionalResourceTypes?: string[];
  import: ResourceImporter<TResourceData>;
  export: ResourceExporter<TResourceData>;
}
