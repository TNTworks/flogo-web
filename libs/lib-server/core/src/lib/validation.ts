const Ajv = require('ajv');
import AjvNS from 'ajv';

export type ValidateFn = AjvNS.SchemaValidateFunction | AjvNS.ValidateFunction;

export interface CustomValidation {
  keyword: string;
  validate: ValidateFn;
}

export type RuleViolationError = AjvNS.ErrorObject;

export type ValidatorFn = (data) => null | RuleViolationError[];

export function validate(
  schema,
  data,
  options = {},
  customValidations?: CustomValidation[]
): null | RuleViolationError[] {
  return createValidator(schema, options, customValidations)(data);
}

export function createValidator(
  schema,
  options?,
  customValidations?: CustomValidation[]
): ValidatorFn {
  options = { useDefaults: true, allErrors: true, ...options };
  const ajv = new Ajv(options);
  if (customValidations) {
    customValidations.forEach(validator =>
      ajv.addKeyword(validator.keyword, {
        validate: validator.validate,
        errors: true,
      })
    );
  }
  return validatorRunner(ajv.compile(schema));
}

function validatorRunner(validateFn: AjvNS.ValidateFunction) {
  return data => {
    const isValid = validateFn(data);
    return isValid ? null : validateFn.errors;
  };
}

export const ValidationRuleFactory = {
  contributionInstalled: contributionRuleFactory,
};

function contributionRuleFactory(
  keyword,
  type,
  refs,
  translateAliasedRef: (fromRef) => string
): ValidateFn {
  return function validator(schema, ref: string) {
    const translatedRef = translateAliasedRef(ref);
    if (ref.startsWith('#') && !translatedRef) {
      (validator as any).errors = [
        {
          keyword: `${keyword}-missing-import`,
          message: `Could not find import for "${ref}": ${ref} is not declared in the "imports" or it references an `,
          params: {
            ref,
          },
        },
      ];
      return false;
    } else {
      if (!refs.includes(translatedRef)) {
        (validator as any).errors = [
          {
            keyword,
            message: `contribution "${ref}" is not installed`,
            params: {
              ref: ref,
            },
          },
        ];
        return false;
      }
    }
    return true;
  };
}
