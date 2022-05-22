import { ValueType } from '@flogo-web/core';

export const ITERABLE_VALUE_KEY = 'iterate';

export function createIteratorMappingContext(iterableValue: string) {
  const mappings = {};
  mappings[ITERABLE_VALUE_KEY] = iterableValue;
  return {
    inputContext: [
      {
        name: ITERABLE_VALUE_KEY,
        type: ValueType.Any,
      },
    ],
    mappings,
  };
}
