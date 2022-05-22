import {
  createValidator,
  CustomValidation,
  ValidatorFn,
} from '@flogo-web/lib-server/core';
const resourceSchema = require('./resource.schema.json');

type RegisteredTypeCheckFn = (type: string) => boolean;

export { ValidatorFn };

export function genericFieldsValidator(isRegisteredType: RegisteredTypeCheckFn) {
  return createValidator(
    resourceSchema,
    {
      removeAdditional: true,
      useDefaults: true,
      allErrors: true,
    },
    [registeredResourceTypeRule(isRegisteredType)]
  );
}

const KEYWORD_RESOURCE_TYPE = 'registered-resource-type';
function registeredResourceTypeRule(
  isRegisteredType: RegisteredTypeCheckFn
): CustomValidation {
  return {
    keyword: KEYWORD_RESOURCE_TYPE,
    validate: function validator(schema, resourceType) {
      const typeIsRegistered = isRegisteredType(resourceType);
      if (!typeIsRegistered) {
        (validator as any).errors = [
          {
            keyword: KEYWORD_RESOURCE_TYPE,
            message: `Cannot process resource type "${resourceType}" as it is not registered`,
            params: {
              resourceType,
            },
          },
        ];
      }
      return typeIsRegistered;
    },
  };
}
