const FEATURES_PREFIX = 'FLOGO_FEATURES_';
const FEATURES_PREFIX_LENGTH = FEATURES_PREFIX.length;

function featuresReducer(features, [envKey, envValue]: [string, any]) {
  if (envKey.startsWith(FEATURES_PREFIX)) {
    features[envKey.slice(FEATURES_PREFIX_LENGTH)] = envValue;
  }
  return features;
}

export function parseFeatureToggles(fromEnv: NodeJS.ProcessEnv) {
  return Object.entries(fromEnv).reduce(featuresReducer, {});
}
