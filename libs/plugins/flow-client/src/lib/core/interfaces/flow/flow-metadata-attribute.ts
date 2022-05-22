import { ValueType } from '@flogo-web/core';

export interface MetadataAttribute {
  name: string;
  type: ValueType;
  value?: any;
}
