import { ValueType } from '@flogo-web/core';

export interface AttributeDescriptor {
  name: string;
  type: ValueType;
  required?: boolean;
  allowed?: any[];
}
