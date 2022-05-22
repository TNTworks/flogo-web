import * as socketio from 'socket.io';
import { engineLogger } from '../../common/logging';
import EventEmitter = NodeJS.EventEmitter;

const CONNECTION_QUERY_PARAMS = {
  start: 0,
  limit: 10,
  until: null,
  order: 'desc' as 'desc',
  fields: ['level', 'timestamp', 'message'],
};
export class EngineLogStreamer {
  private cleanup: Function;
  constructor(private channel: EventEmitter) {}

  init() {
    const logStreamListener = logData => {
      this.channel.emit(
        'on-log',
        JSON.stringify({
          level: logData.level,
          message: logData.message,
          timestamp: logData.timestamp,
        })
      );
    };
    const logStream = engineLogger.stream({ start: -1 });
    logStream.on('log', logStreamListener);
    this.cleanup = () => logStream.removeListener('log', logStreamListener);
  }

  onNewConnection(client: socketio.Socket) {
    engineLogger.query(
      { ...CONNECTION_QUERY_PARAMS, until: new Date() },
      (err, results) => {
        if (err) {
          console.log(err);
        }
        const docs = results['file'] || [];
        client.emit('on-connecting', JSON.stringify(docs.reverse()));
      }
    );
  }

  destroy() {
    if (this.cleanup) {
      this.cleanup();
    }
  }
}
