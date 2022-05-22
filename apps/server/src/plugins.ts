import { flowPlugin } from '@flogo-web/plugins/flow-server';
import { streamPlugin } from '@flogo-web/plugins/stream-server';
import { ExtensionsServer } from './extension';

export function loadPlugins(flogoServer: ExtensionsServer) {
  flogoServer.use(flowPlugin);
  flogoServer.use(streamPlugin);
}
