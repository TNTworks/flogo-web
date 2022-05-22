import * as socketio from 'socket.io';
import { EngineLogStreamer } from './engine-log-streamer';
import { StreamSimulator, SimulationClient } from '../../modules/simulator';

// TODO: inject config
export function init(server, { streamSimulator }: { streamSimulator: StreamSimulator }) {
  const wsServer: socketio.Server = require('socket.io')(server);

  let closed = false;
  server.on('close', () => {
    if (closed) {
      return;
    }
    closed = true;
    wsServer.close();
  });

  const engineLoggerNs = wsServer.of('/engine-logger');
  const engineLogStreamer = new EngineLogStreamer(engineLoggerNs);
  engineLoggerNs.on('connection', clientSocket => {
    engineLogStreamer.onNewConnection(clientSocket);
  });
  engineLogStreamer.init();

  wsServer.of('/stream-simulator').on('connection', clientSocket => {
    streamSimulator.updateClient(new SimulationClient(clientSocket));
  });
}
