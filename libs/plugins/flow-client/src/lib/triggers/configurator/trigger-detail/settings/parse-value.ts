import { isBoolean, isUndefined, toNumber } from 'lodash';

import { TypeConnection, ValueType } from '@flogo-web/core';
import { parseResolver } from '@flogo-web/parser';

import { SettingValue } from '../settings-value';
import { isExpression } from '../../core/utils';

export function parseValue(type: ValueType, viewValue: string): SettingValue {
  if (isExpression(viewValue)) {
    return {
      viewValue,
      parsedValue: viewValue,
      parsingDetails: parseResolver(viewValue),
    };
  } else {
    return {
      viewValue,
      parsedValue: coerce(type, viewValue),
    };
  }
}

function coerce(type: ValueType | TypeConnection, inputValue: string) {
  switch (type) {
    case ValueType.Double:
    case ValueType.Integer:
    case ValueType.Long:
      return toNumber(inputValue);
    case ValueType.Boolean:
      return coerceToBoolean(inputValue);
    case ValueType.Array:
    case ValueType.Object:
    case ValueType.Params:
    case TypeConnection.Connection:
      return coerceToJsonOrUndefined(inputValue);
    case ValueType.Any:
      return attemptAnyCoercion(inputValue);
  }
  return inputValue;
}

function attemptAnyCoercion(value: string) {
  const asNumber = parseFloat(value);
  if (!isNaN(asNumber)) {
    return asNumber;
  }
  const asBoolean = coerceToBoolean(value);
  if (isBoolean(asBoolean)) {
    return asBoolean;
  }
  const asJson = coerceToJsonOrUndefined(value);
  if (!isUndefined(asJson)) {
    return asJson;
  }
  return value;
}

function coerceToBoolean(inputValue: string) {
  if (inputValue === 'true') {
    return true;
  } else if (inputValue === 'false') {
    return false;
  } else {
    return undefined;
  }
}

function coerceToJsonOrUndefined(inputValue: string) {
  try {
    return JSON.parse(inputValue);
  } catch (e) {
    return undefined;
  }
}
