import { FlogoPlugin, PluginServer } from '@flogo-web/lib-server/core';
import { ResourcePluginRegistry } from './plugin-registry';

export class ExtensionsServer {
  private readonly pluginServer: PluginServer;

  constructor(resourcePluginRegistry: ResourcePluginRegistry) {
    this.pluginServer = {
      resources: resourcePluginRegistry,
    };
  }

  use(plugin: FlogoPlugin) {
    if (!plugin) {
      return;
    }
    this.throwIfInvalid(plugin);
    plugin.register(this.pluginServer);
  }

  private throwIfInvalid(plugin: FlogoPlugin) {
    if (typeof plugin.register !== 'function') {
      throw new Error('PluginRegistrar: expecting plugin.register to be a function');
    }
  }
}
