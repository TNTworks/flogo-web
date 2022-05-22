import { ValidationError } from './errors';

export class ValidatorReporter {
  errors = [];

  report(error: ValidationError) {
    this.errors.push(error);
  }

  getErrors() {
    return this.errors;
  }
}
