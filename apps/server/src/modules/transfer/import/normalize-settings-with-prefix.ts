import { isString, mapValues } from 'lodash';
import { EXPR_PREFIX, FlogoAppModel } from '@flogo-web/core';

export function normalizeSettingsWithPrefix(
  settings: FlogoAppModel.Settings
): FlogoAppModel.Settings {
  return mapValues(settings, normalizeSetting);
}

function normalizeSetting(setting: any) {
  if (isString(setting) && setting.startsWith('=')) {
    return setting;
  }
  let normalizedValue = setting;
  if (isString(setting) && setting.startsWith('$')) {
    normalizedValue = EXPR_PREFIX + setting;
  }
  return normalizedValue;
}
