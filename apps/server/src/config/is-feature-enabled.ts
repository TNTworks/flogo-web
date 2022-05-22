import { config } from './app-config';

export function isFeatureEnabled(featureName: string) {
  return config.features && config.features[featureName];
}
