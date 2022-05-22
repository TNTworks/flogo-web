import { ValueType } from '@flogo-web/core';
/**
 * get default value of a given type
 */
export function getDefaultValue(forType: ValueType): any {
  return ValueType.defaultValueForType.get(forType);
}
