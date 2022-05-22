import { ValueType } from '../value-types';

export interface Resource<TResourceData = unknown> {
  id: string;
  name: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  metadata?: Metadata;
  data: TResourceData;
}

export interface Metadata {
  input: MetadataAttribute[];
  output: MetadataAttribute[];
}

export interface MetadataAttribute {
  name: string;
  type: ValueType;
  value?: any;
}
