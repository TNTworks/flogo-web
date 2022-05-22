import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  SchemaSettingAttributeDescriptor as SchemaAttribute,
  ValueType,
} from '@flogo-web/core';
import { SettingValue } from '../settings-value';
import { requiredValidator } from './required.validator';
import { getAllowedValueValidator } from './allowed-value.validator';
import { getStrictTypeValidator } from './type.validator';
import { validateExpression } from './resolver.validator';
import { isResolverExpression } from './is-resolver-expression';

export * from './error-types';

export function createValidatorsForSchema(attrSchema: SchemaAttribute) {
  const validators: ValidatorFn[] = [];
  addRequiredValidation(attrSchema.required, validators);
  addIsAllowedValueValidation(attrSchema.allowed, validators);
  addTypeOrResolverValidation(attrSchema.type as ValueType, validators);
  return validators;
}

export function addRequiredValidation(
  isRequired: boolean,
  validators: ValidatorFn[] = []
) {
  if (isRequired) {
    validators.push(requiredValidator);
  }
}

export function addIsAllowedValueValidation(
  allowedValues: any[],
  validators: ValidatorFn[]
) {
  if (allowedValues && allowedValues.length > 0) {
    const allowedValueValidator = getAllowedValueValidator(allowedValues);
    validators.push((control: AbstractControl) =>
      !isResolverExpression(control.value.parsedValue)
        ? allowedValueValidator(control)
        : null
    );
  }
}

export function addTypeOrResolverValidation(
  valueType: ValueType,
  validators: ValidatorFn[]
) {
  const typeValidator = getStrictTypeValidator(valueType);
  const validator = getComposedExpressionOrTypeValidator(typeValidator);
  validators.push((control: AbstractControl) => validator(control.value));
}

function getComposedExpressionOrTypeValidator(
  strictTypeValidator: (value: any) => (ValidationErrors | null) | null
) {
  strictTypeValidator = strictTypeValidator ? strictTypeValidator : () => null;
  return (settingValue: SettingValue) => {
    if (!settingValue || !settingValue.viewValue) {
      return null;
    }

    return isResolverExpression(settingValue.parsedValue)
      ? validateExpression(settingValue)
      : strictTypeValidator(settingValue.parsedValue);
  };
}
