import { mapValues, isString } from 'lodash';
import { Dictionary } from '@flogo-web/lib-client/core';

export function normalizeSettings(settings: Dictionary<any>): Dictionary<any> {
  return mapValues(settings, removeExpressionPrefix);
}

const removeExpressionPrefix = (value: any) =>
  isString(value) && value.startsWith('=') ? value.substr(1) : value;
