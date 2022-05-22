import { isString, isPlainObject } from 'lodash';
import { resolveExpressionType } from '@flogo-web/parser';

type ObjectExpression = object & { mapping: any };

const shouldAddPrefix: (string) => boolean = (expression: string) => {
  const expressionType = resolveExpressionType(expression);
  /**
   * Need to prefix if the expression is 'attrAccess' then only if it starts with '$' otherwise,
   * for all values which are not of literal type
   */
  return !(
    expressionType === 'literal' ||
    (expressionType === 'attrAccess' && !expression.startsWith('$'))
  );
};

/**
 * Iterate value can skip normalization if it is:
 * 1. An expression : A string and starts with "=". Ex: "=$env[variable]"
 * 2. An Object expression: An object which has "mapping" key. Ex.
 *        {
 *          "mapping": [{
 *               "in": "=$env[variable]",
 *            }, {
 *               "in": "{{ $prop[property] }}"
 *           }]
 *        }
 * @param value
 * @return boolean
 */

const skipNormalization = (value: ObjectExpression | string): boolean => {
  return (
    (isString(value) && (value as string).startsWith('=')) ||
    (isPlainObject(value) && (value as ObjectExpression).mapping !== undefined)
  );
};

export function normalizeIteratorValue(value: any): any {
  if (skipNormalization(value)) {
    return value;
  }
  const stringedValue = isString(value) ? value : JSON.stringify(value, null, 2);
  return shouldAddPrefix(stringedValue) ? '=' + stringedValue : value;
}
