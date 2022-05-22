import * as path from 'path';

import './load-env';
import { parseFeatureToggles } from './parse-features-toggles';
const features = parseFeatureToggles(process.env);

const rootPath = path.resolve(__dirname, '..');
const PUBLIC_DIR =
  process.env.FLOGO_WEB_PUBLICDIR || path.resolve(rootPath, '..', 'client');
const LOCAL_DIR =
  process.env.FLOGO_WEB_LOCALDIR ||
  path.resolve(rootPath, '..', '..', '..', 'dist', 'local');

const FLOW_SERVICE_HOST = process.env.FLOGO_FLOW_SERVICE_HOST || 'localhost';
const FLOW_STATE_SERVICE_HOST = process.env.FLOGO_FLOW_STATE_SERVICE_HOST || 'localhost';
const FLOW_WEB_HOST = __extractDomain(process.env.FLOGO_FLOW_WEB_HOST || 'localhost');

const FLOW_STATE_SERVICE_PORT = process.env.FLOGO_FLOW_STATE_SERVICE_PORT || '9190';
const FLOW_SERVICE_PORT = process.env.FLOGO_FLOW_SERVICE_PORT || '9090';
const FLOW_TESTER_PORT = process.env.FLOGO_FLOW_TESTER_PORT || '8080';

const DB_DIR = process.env.FLOGO_WEB_DBDIR || path.resolve(LOCAL_DIR, 'db');

const logLevel = process.env.FLOGO_WEB_LOGLEVEL || 'debug';

const appPort = process.env.PORT || 3303;

const enginesRoot = path.join(LOCAL_DIR, 'engines');
const defaultEngineName = 'flogo-web';
const defaultEngine = path.join(enginesRoot, defaultEngineName);

let libVersion = process.env.FLOGO_LIB_VERSION || process.env.FLOGO_WEB_LIB_VERSION;
if (!libVersion) {
  libVersion = 'latest';
}

const config = {
  db: 'http://localhost:5984/flogo-web',
  rootPath,
  publicPath: PUBLIC_DIR,
  logsPath: path.join(LOCAL_DIR, 'logs'),
  uploadsPath: path.join(LOCAL_DIR, 'uploads'),
  logLevel,
  localPath: LOCAL_DIR,
  features,
  defaultAppJsonPath: path.join(rootPath, 'config', 'sample-app.json'),
  defaultFlogoDescriptorPath:
    process.env.FLOGO_WEB_DEFAULT_DESCRIPTOR ||
    path.join(rootPath, 'config', 'default-flogo.json'),
  defaultFlogoEngineConfigPath:
    process.env.FLOGO_WEB_DEFAULT_ENGINE_CONFIG ||
    path.join(rootPath, 'config', 'test-engine.config.json'),
  libVersion,
  app: {
    basePath: '/v1/api',
    basePathV2: '/api/v2',
    port: appPort,
    // 7 * 24 * 60 * 60 * 1000 /* default caching time (7 days) for static files, calculated in milliseconds */
    cacheTime: 0,
    gitRepoCachePath: path.join(rootPath, 'git-cache'),
  },
  exportedAppBuild: path.join(enginesRoot, 'exported-app-build.json'),
  appBuildEngine: {
    path: path.resolve(enginesRoot, 'app-build'),
  },
  defaultEngine: {
    path: defaultEngine,
    defaultContribBundle:
      process.env.FLOGO_WEB_DEFAULT_PALETTE ||
      path.join(rootPath, 'config', 'default-contrib-bundle.json'),
  },
  /* apps module config */
  // TODO: consolidate and cleanup
  apps: {
    dbPath: path.resolve(DB_DIR, 'flogo.db'),
  },
  indexer: {
    dbPath: path.resolve(DB_DIR, 'indexer.db'),
  },
  buildEngine: {
    host: 'localhost',
    port: '8081',
    path: './',
    name: 'build-engine',
    installConfig: {},
    config: {
      loglevel: 'DEBUG',
      // flowRunner will be eventually replaced by actionRunner
      flowRunner: {
        type: 'pooled',
        pooled: {
          numWorkers: 5,
          workQueueSize: 50,
          maxStepCount: 32000,
        },
      },
      actionRunner: {
        type: 'pooled',
        pooled: {
          numWorkers: 5,
          workQueueSize: 50,
          maxStepCount: 32000,
        },
      },
      services: [
        {
          name: 'stateRecorder',
          enabled: false,
          settings: {
            host: FLOW_STATE_SERVICE_HOST,
            port: FLOW_STATE_SERVICE_PORT,
          },
        },
        {
          name: 'flowProvider',
          enabled: true,
          settings: {
            host: FLOW_SERVICE_HOST,
            port: FLOW_SERVICE_PORT,
          },
        },
        {
          name: 'engineTester',
          enabled: true,
          settings: {
            port: FLOW_TESTER_PORT,
          },
        },
      ],
    },
  },
  flogoWeb: {
    protocol: 'http',
    host: FLOW_WEB_HOST,
    port: '5984',
    testPath: 'flogo-web',
    label: 'Application database',
  },
  flogoWebActivities: {
    protocol: 'http',
    host: FLOW_WEB_HOST,
    port: '5984',
    testPath: 'flogo-web-activities',
    label: 'Activities',
  },
  flogoWebTriggers: {
    protocol: 'http',
    host: FLOW_WEB_HOST,
    port: '5984',
    testPath: 'flogo-web-triggers',
    label: 'Triggers',
  },
  stateServer: {
    protocol: 'http',
    host: FLOW_STATE_SERVICE_HOST,
    port: '9190',
    basePath: '/v1',
    testPath: '/v1/ping',
  },
  processServer: {
    protocol: 'http',
    host: FLOW_SERVICE_HOST,
    port: '9090',
    basePath: '/v1',
    testPath: '/v1/ping',
  },
  webServer: {
    protocol: 'http',
    host: FLOW_WEB_HOST,
    port: appPort,
    testPath: '',
  },
  engine: {
    protocol: 'http',
    host: 'localhost',
    port: '8080',
    testPath: 'status',
  },
  streamSimulation: {
    restControlUrl:
      process.env.FLOGO_WEB_STREAM_TRIGGER_URL || 'http://localhost:9998/tester',
    wsUrl: process.env.FLOGO_WEB_STREAM_WS_URL || 'ws://localhost:9999/telemetry',
  },
};

export { config };

function __extractDomain(url) {
  let domain;
  if (url.indexOf('://') > -1) {
    domain = url.split('/')[2];
  } else {
    domain = url.split('/')[0];
  }
  domain = domain.split(':')[0];
  return domain;
}
