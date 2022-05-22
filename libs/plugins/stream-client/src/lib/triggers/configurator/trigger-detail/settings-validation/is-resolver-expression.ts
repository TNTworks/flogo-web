import { isString } from 'lodash';

export function isResolverExpression(value: string) {
  return isString(value) && value.startsWith('$');
}
