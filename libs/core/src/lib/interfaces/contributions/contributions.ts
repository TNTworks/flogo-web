import { ContributionType } from '../../constants';
import {
  SchemaAttributeDescriptor,
  SchemaSettingAttributeDescriptor,
  SchemaOutput,
  BaseContributionSchema,
} from './common';
import { FunctionsSchema } from './functions';

export interface ActivitySchema extends BaseContributionSchema {
  type: ContributionType.Activity;
  settings?: SchemaSettingAttributeDescriptor[];
  input?: SchemaAttributeDescriptor[];
  output?: SchemaOutput[];
  return?: boolean;
  /**
   * @deprecated should use 'input'
   */
  inputs?: SchemaAttributeDescriptor[];
  /**
   * @deprecated should use 'output'
   */
  outputs?: SchemaOutput[];
}

export interface TriggerSchema extends BaseContributionSchema {
  type: ContributionType.Trigger;
  reply?: SchemaAttributeDescriptor[];
  output?: SchemaAttributeDescriptor[];
  settings?: SchemaSettingAttributeDescriptor[];
  handler?: {
    settings: SchemaSettingAttributeDescriptor[];
  };
  /**
   * @deprecated should use 'output'
   */
  outputs?: SchemaOutput[];
}

export interface ActionSchema extends BaseContributionSchema {
  type: ContributionType.Action;
}

export type ContributionSchema =
  | TriggerSchema
  | ActivitySchema
  | FunctionsSchema
  | ActionSchema;
