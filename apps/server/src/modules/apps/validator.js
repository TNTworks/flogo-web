import defaults from 'lodash/defaults';
import Ajv from 'ajv';

import {
  appSchema,
  handlerEditableSchema,
  triggerSchemaCreate,
  triggerSchemaUpdate,
} from './schemas';

function validate(schema, data, options = {}, customValidations) {
  const ajv = new Ajv(options);

  if (customValidations) {
    customValidations.forEach(validator =>
      ajv.addKeyword(validator.keyword, {
        validate: validator.validate,
        errors: true,
      })
    );
  }

  const valid = ajv.validate(schema, data);
  return valid ? null : ajv.errors;
}

export class Validator {
  static validateSimpleApp(data) {
    return validate(appSchema, data, {
      removeAdditional: true,
      useDefaults: true,
      allErrors: true,
    });
  }

  static validateTriggerCreate(data) {
    return validate(triggerSchemaCreate, data, {
      removeAdditional: true,
      useDefaults: true,
      allErrors: true,
    });
  }

  static validateTriggerUpdate(data) {
    return validate(triggerSchemaUpdate, data, {
      removeAdditional: true,
      useDefaults: true,
      allErrors: true,
    });
  }

  static validateHandler(data) {
    return validate(handlerEditableSchema, data, {
      removeAdditional: true,
      useDefaults: true,
      allErrors: true,
    });
  }
}
