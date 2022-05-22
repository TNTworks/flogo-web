import { FlogoError } from '@flogo-web/lib-server/core';
import { ERROR_TYPES } from './error-types';

export interface RestErrorDetails {
  /**
   * The HTTP status code applicable to this problem. Defaults to 400
   * */
  status?: number;
  /**
   * An application-specific error code, expressed as a string value.
   */
  code?: string;
  title?: string;
  /**
   * A human-readable explanation specific to this occurrence of the problem.
   */
  detail?: string;
  meta?: object;
}

export class RestError extends FlogoError {
  details: { status: number } & { [key: string]: any };
  constructor(
    message: string,
    status: number,
    details: RestErrorDetails = {},
    constructorOpt?: Function
  ) {
    super(message, {
      type: ERROR_TYPES.COMMON.REST_API,
      details: {
        ...details,
        status: status || 400,
      },
      ctr: constructorOpt || RestError,
    });
  }
}
