import { isString } from 'lodash';

export function isExpression(value: string = '') {
  return isString(value) && value.startsWith('$');
}
