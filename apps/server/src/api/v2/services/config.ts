import { config } from '../../../config/app-config';

export function getServiceRegistry() {
  return {
    engine: config.engine,
    stateServer: config.stateServer,
    flowServer: config.processServer,
    'flogo-web': config.flogoWeb,
    'flogo-web-activities': config.flogoWebActivities,
    'flogo-web-triggers': config.flogoWebTriggers,
  };
}

export function getConfigSummary() {
  return {
    engine: config.engine,
    stateServer: config.stateServer,
    flowServer: config.processServer,
    webServer: config.webServer,
    db: config.flogoWeb,
    activities: config.flogoWebActivities,
    triggers: config.flogoWebTriggers,
  };
}
