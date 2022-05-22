import { InjectionToken } from '@angular/core';
import { ResourcePluginManifest } from '@flogo-web/lib-client/core';

export const RESOURCE_PLUGINS_CONFIG = new InjectionToken<ResourcePluginManifest[]>(
  'flogo.resource-plugins'
);
