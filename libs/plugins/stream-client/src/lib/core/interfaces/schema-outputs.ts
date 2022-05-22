import { SchemaOutput, ContributionType } from '@flogo-web/core';

export const FLOGO_ACTIVITY_TYPE = ContributionType.Activity;

export interface SchemaOutputs {
  type: string;
  stage: string;
  outputs: SchemaOutput[];
}
