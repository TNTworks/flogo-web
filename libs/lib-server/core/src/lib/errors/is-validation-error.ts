import { ValidationError } from './validation-error';
import { ErrorCodes } from './error-codes';

export function isValidationError(err): err is ValidationError {
  return (<ValidationError>err).type === ErrorCodes.Common.Validation;
}
