import { rootContainer, createApp as createServerApp, boostrapEngine } from './init';

import { initDb } from './common/db';
import { logger } from './common/logging';
import { config } from './config';
import { init as initWebsocketApi } from './api/ws';
import { StreamSimulator } from './modules/simulator';

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

initDb()
  .then(() => {
    return boostrapEngine(config.defaultEngine.path);
  })
  .then(() =>
    createServerApp({
      port: config.app.port as string,
      staticPath: config.publicPath,
      logsRoot: config.localPath,
      uploadsRoot: config.uploadsPath,
      container: rootContainer,
    })
  )
  .then(newServer => initWebSocketApi(newServer))
  .then(() => {
    console.log('flogo-web::server::ready');
    showBanner();
  })
  .catch(err => {
    logger.error(err && err.message);
    console.error(err);
    process.exit(1);
  });

function initWebSocketApi(newServer) {
  if (!process.env['FLOGO_WEB_DISABLE_WS']) {
    return initWebsocketApi(newServer, {
      streamSimulator: rootContainer.get(StreamSimulator),
    });
  }
  logger.info("Won't start websocket service");
  return null;
}

function showBanner() {
  console.log(`
  ======================================================
                 ___       __   __   __ TM
                |__  |    /  \\ / _\` /  \\
                |    |___ \\__/ \\__| \\__/

   [success] open http://localhost:${config.app.port} in your browser
  ======================================================
`);
}
