import { BaseContributionSchema } from './common';
import { ContributionType } from '../../constants';

interface FunctionArgument {
  name: string;
  type: string;
}

export interface SingleFunctionSchema {
  name: string;
  description?: string;
  varArgs?: boolean;
  args?: FunctionArgument[];
}

export interface FunctionsSchema extends BaseContributionSchema {
  type: ContributionType.Function;
  functions: SingleFunctionSchema[];
}
