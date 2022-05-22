import { Injectable } from '@angular/core';
import { ERROR_CODE, ERROR_CONSTRAINT } from '../constants';

const ERROR_MAP = {
  [ERROR_CODE.UNIQUE]: ERROR_CONSTRAINT.NOT_UNIQUE,
  [ERROR_CODE.NOT_INSTALLED_ACTIVITY]: ERROR_CONSTRAINT.NOT_INSTALLED_ACTIVITY,
  [ERROR_CODE.NOT_INSTALLED_TRIGGER]: ERROR_CONSTRAINT.NOT_INSTALLED_TRIGGER,
  [ERROR_CODE.WRONG_INPUT_JSON_FILE]: ERROR_CONSTRAINT.WRONG_INPUT_JSON_FILE,
};

export interface OperationalError extends Error {
  isOperational: true;
  details?: { [key: string]: any };

  // allow custom props
  [propName: string]: any;
}

@Injectable()
export class ErrorService {
  public transformRestErrors(
    errors: {
      code: string;
      status: number | string;
      meta?: {
        details: {
          detail: string;
          property: string;
          title: string;
          type: string;
          value: string;
        }[];
      };
    }[]
  ): { [key: string]: boolean } {
    const firstError = errors[0];
    if (firstError && (firstError.status === 500 || firstError.status === '500')) {
      // internal error
      return { unknown: true };
    }

    const errorDetails = firstError.meta && firstError.meta.details;
    const transformed = {};
    errorDetails.forEach(error => {
      const constraint = ERROR_MAP[error.type];
      if (constraint) {
        transformed[constraint] = true;
      }
    });

    return transformed;
  }

  /**
   * Create an operational error.
   *
   * @example
   *  let error = makeOperationalError('Something happened', 'CustomError', { details: { value: 4, max: 3 } });
   *  error.name // 'CustomError
   *  error.details // { value: 4, max: 3}
   *
   * @example
   *  let error = makeOperationalError('Something happened', 'CustomError', { value: 4, max: 3});
   *  error.name // 'CustomError
   *  error.details // undefined
   *  error.value // 4
   *  error.max // 3
   *
   * @param {string} name - Error name
   * @param {string} message - Error description
   * @param {object} props [props] - Key value pairs of additional data that will be added as properties of the error that will be created
   * @return {OperationalError}
   */
  public makeOperationalError<T extends OperationalError>(
    name: string,
    message: string,
    props?: { [key: string]: any }
  ): OperationalError {
    const error = <OperationalError>new Error(message);
    error.isOperational = true;
    error.name = name;

    if (this.canCaptureStack(Error)) {
      Error.captureStackTrace(error, this.makeOperationalError);
    }

    if (props) {
      Object.keys(props).forEach(key => {
        // do not override other properties
        if (!error[key]) {
          error[key] = props[key];
        }
      });
    }

    return error;
  }

  private canCaptureStack(
    fromClass: any
  ): fromClass is { captureStackTrace: (thisArg: any, func: any) => void } {
    return !!fromClass.captureStackTrace;
  }
}
