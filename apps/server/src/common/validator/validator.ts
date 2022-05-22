import { ErrorManager } from '../errors';

export class Validator {
  ajvInstance;
  schema;
  constructor(schema, ajvInstance) {
    this.schema = schema;
    this.ajvInstance = ajvInstance;
  }

  addValidationRule(keyword, rule) {
    this.ajvInstance.addKeyword(keyword, rule);
  }

  validate(value) {
    const isValid = this.ajvInstance.validate(this.schema, value);
    if (!isValid) {
      const errors = this.ajvInstance.errors;
      throw ErrorManager.createValidationError('Validation error', errors);
    }
  }
}
