import { isArray, isUndefined } from 'lodash';
import { AbstractControl } from '@angular/forms';
import { ErrorTypes, ErrorValueNotAllowed } from './error-types';

export function getAllowedValueValidator(allowedValues: any[]) {
  if (!allowedValues || !isArray(allowedValues)) {
    return (control: AbstractControl) => null;
  }
  return (control: AbstractControl) => {
    const userValue = control.value ? control.value.parsedValue : undefined;
    if (isUndefined(userValue) || userValue === '') {
      return null;
    }
    /* tslint:disable-next-line:triple-equals */
    const isAllowedValue = !allowedValues.find(val => val == userValue);
    return isAllowedValue
      ? {
          [ErrorTypes.ValueNotAllowed]: {
            allowedValues: allowedValues,
          } as ErrorValueNotAllowed,
        }
      : null;
  };
}
