import { FlogoError } from './flogo-error';
import { ErrorCodes } from './error-codes';
import { ValidationErrorDetail } from './validation-error-detail';

export class ValidationError extends FlogoError {
  public details: { errors: ValidationErrorDetail[] };
  constructor(message, errors: ValidationErrorDetail[], constructorOpt?: Function) {
    super(message, {
      type: ErrorCodes.Common.Validation,
      // todo: simplify the error interface, keeping it like this for now to minimize api code impact and client side compatibility
      details: { errors },
      ctr: constructorOpt || ValidationError,
    });
  }
}
