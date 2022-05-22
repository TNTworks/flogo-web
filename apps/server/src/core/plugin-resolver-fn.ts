import { ResourceHooks } from '@flogo-web/lib-server/core';

export type PluginResolverFn = (resourceType: string) => ResourceHooks;
