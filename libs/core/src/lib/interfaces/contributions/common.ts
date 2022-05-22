import { ValueType, TypeConnection } from '../../value-types';

export interface BaseContributionSchema {
  name: string;
  type: string;
  ref: string;
  version: string;
  title?: string;
  description?: string;
  homepage?: string;
  icon?: string;
}

export interface SchemaOutput {
  name: string;
  type: ValueType;
}

export interface SchemaAttributeDescriptor {
  name: string;
  type: ValueType;
  required?: boolean;
  allowed?: any[];
  value?: any;
  display?: {
    name?: string;
    type: string;
    mapperOutputScope?: string;
  };
}

export interface SchemaSettingAttributeDescriptor {
  name: string;
  type: ValueType | TypeConnection;
  required?: boolean;
  allowed?: any[];
  value?: any;
  display?: {
    name?: string;
    type: string;
    mapperOutputScope?: string;
  };
}
