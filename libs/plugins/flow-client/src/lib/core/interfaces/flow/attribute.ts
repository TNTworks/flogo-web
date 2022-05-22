import { ValueType } from '@flogo-web/core';

export interface TaskAttribute {
  name: string;
  type: ValueType;
  value: any;
  title?: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  validation?: '';
  validationMessage?: '';
  child?: TaskAttribute[];
}

export interface TaskAttributes {
  inputs?: TaskAttribute[];
  outputs?: TaskAttribute[];
}
