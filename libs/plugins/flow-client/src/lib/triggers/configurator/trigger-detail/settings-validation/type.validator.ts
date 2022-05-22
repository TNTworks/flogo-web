import {
  isNaN as isNotaNumber,
  isBoolean,
  isPlainObject,
  isArray,
  isNumber,
} from 'lodash';
import { ValidationErrors } from '@angular/forms';
import { ValueType } from '@flogo-web/core';
import { ErrorTypeMismatch, ErrorTypes } from './error-types';

export function getStrictTypeValidator(
  schemaType: ValueType
): (value: any) => (ValidationErrors | null) | null {
  switch (schemaType) {
    case ValueType.Integer:
    case ValueType.Long:
    case ValueType.Double:
      return getNumberValidator(schemaType);
    case ValueType.Boolean:
      return booleanValidator;
    case ValueType.Object:
    case ValueType.Params:
      return getObjectValidator(schemaType);
    case ValueType.Array:
      return arrayValidator;
  }
  return null;
}

function makeMismatchError(
  expectedType: ValueType
): { [type: string]: ErrorTypeMismatch } {
  return { [ErrorTypes.TypeMismatch]: { expectedType } };
}

export function getNumberValidator(expectedType: ValueType) {
  return value =>
    isNotaNumber(value) || !isNumber(value) ? makeMismatchError(expectedType) : null;
}

export function booleanValidator(value: any) {
  return !isBoolean(value) ? makeMismatchError(ValueType.Boolean) : null;
}

export function getObjectValidator(expectedType: ValueType) {
  return value => (!isPlainObject(value) ? makeMismatchError(expectedType) : null);
}

export function arrayValidator(value: any) {
  return !isArray(value) ? makeMismatchError(ValueType.Array) : null;
}
