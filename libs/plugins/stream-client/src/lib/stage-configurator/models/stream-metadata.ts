import { ValueType } from '@flogo-web/core';

export interface StreamMetadata {
  type: 'metadata';
  input: Array<{ name: string; type: ValueType }>;
  output: Array<{ name: string; type: ValueType }>;
}
