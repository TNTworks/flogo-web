import { mapValues, isNil, omitBy } from 'lodash';

import { FormGroup } from '@angular/forms';
import { EXPR_PREFIX } from '@flogo-web/core';

import { SettingValue } from '../../trigger-detail/settings-value';
import { isExpression } from '../../core/utils';

const addPrefixForExpressions = ({ parsedValue }) =>
  isExpression(parsedValue) ? EXPR_PREFIX + parsedValue : parsedValue;

export function convertSettingsFormValues(formGroup: FormGroup) {
  let values: { [proo: string]: string } = mapValues<SettingValue, string>(
    formGroup.value,
    addPrefixForExpressions
  );
  values = omitBy(values, val => isNil(val) || val === '');
  return values;
}
