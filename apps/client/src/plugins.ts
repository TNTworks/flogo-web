import { ResourcePluginManifest } from '@flogo-web/lib-client/core';

export const resourcePlugins: ResourcePluginManifest[] = [
  {
    label: 'Flow',
    type: 'flow',
    path: 'flow',
    loadChildren: () => import('@flogo-web/plugins/flow-client').then(m => m.FlowModule),
    color: '#33c6d8',
  },
  {
    label: 'Stream',
    type: 'stream',
    path: 'stream',
    loadChildren: () =>
      import('@flogo-web/plugins/stream-client').then(m => m.StreamClientModule),
    color: '#96a7f8',
  },
];
