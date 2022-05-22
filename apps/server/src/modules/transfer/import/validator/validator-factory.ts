import { ContributionType } from '@flogo-web/core';
import { ImportsRefAgent, ValidationRuleFactory } from '@flogo-web/lib-server/core';
import { validatorFactory as commonValidatorFactory } from '../../../../common/validator';

/**
 * @param schema
 * @param contributionRefs
 * @param options
 * @param importsRefAgent
 * @return {Validator}
 */
export function validatorFactory(
  schema,
  contributionRefs: string[],
  options = {},
  importsRefAgent: ImportsRefAgent
) {
  const validator = commonValidatorFactory(schema, options);
  validator.addValidationRule('trigger-installed', {
    errors: true,
    validate: ValidationRuleFactory.contributionInstalled(
      'trigger-installed',
      'Trigger',
      contributionRefs || [],
      ref => importsRefAgent.getPackageRef(ContributionType.Trigger, ref)
    ),
  });
  return validator;
}
