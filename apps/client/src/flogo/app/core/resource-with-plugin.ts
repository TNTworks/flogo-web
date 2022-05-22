import { Resource } from '@flogo-web/core';
import { ResourcePluginManifest } from '@flogo-web/lib-client/core';

export interface ResourceWithPlugin extends Resource {
  pluginInfo: ResourcePluginManifest;
}
