import { FlogoError, ValidationError } from '@flogo-web/lib-server/core';
import { ERROR_TYPES } from './error-types';
import { RestError } from './rest-errors';

export class ErrorManager {
  /**
   *
   * @param message {string}
   * @param options {object}
   * @param options.type {string} error type (see error constants)
   * @param [options.details] {object}
   * @return {FlogoError}
   */
  static makeError(message, options) {
    return new FlogoError(message, { ctr: ErrorManager.makeError, ...options });
  }

  /**
   *
   * @param message
   * @param details
   * @param [ctr]
   */
  static createValidationError(message, errors: any[], ctr?) {
    return new ValidationError(
      message,
      errors,
      ctr || ErrorManager.createValidationError
    );
  }

  /**
   * Creates a custom validation error object which caused due to the data the server logic is performing on.
   * The method has message, keyword and details as parameters.
   *
   * @param {string} message - message to be sent to the client
   * @param {string} keyword
   * @param {object} [details] - optional details
   */
  static createCustomValidationError(
    message,
    keyword,
    { dataPath, params }: { dataPath?; params? } = {}
  ) {
    if (!keyword) {
      throw new Error('Missing required keyword parameter');
    }
    const error = {
      keyword,
      message,
      schemaPath: '#/custom',
      dataPath: dataPath || '',
      params: params || {},
    };

    return ErrorManager.createValidationError('Validation error', [error]);
  }

  /**
   * Create a sanitized error marked as ready to propagate from the API to the user
   * @param message {string} message
   * @param details {any} Error details
   * @param details.status {int} The HTTP status code applicable to this problem. Defaults to 400
   * @param details.code {string} An application-specific error code, expressed as a string value.
   * @param details.title {string} A short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem
   * @param details.detail {string} (optional) A human-readable explanation specific to this occurrence of the problem.
   * @param details.meta {object} (optional) A meta object containing non-standard meta-information about the error. Ex. for validation the property details
   * @param [ctr]
   */
  static createRestError(message = 'REST Api Error', details, ctr?: Function) {
    return new RestError(
      message,
      details.status,
      details,
      ctr || ErrorManager.createRestError
    );
  }

  /**
   * Create a sanitized error marked as ready to propagate from the API to the user
   * @param message {string} message
   * @param [details] {any} Error details
   * @param details.title {string} (optional) A short, human-readable summary of the problem that SHOULD NOT change from occurrence to occurrence of the problem
   * @param details.detail {string} (optional) A human-readable explanation specific to this occurrence of the problem.
   * @param details.meta {object} (optional) A meta object containing non-standard meta-information about the error. Ex. for validation the property details
   */
  static createRestNotFoundError(
    message = 'Resource not found',
    details: { status?: number; title?: string; detail?: any; [key: string]: any } = {}
  ) {
    return new RestError(
      message,
      details.status || 404,
      {
        title: 'Resource not found',
        code: ERROR_TYPES.COMMON.NOT_FOUND,
        ...details,
      },
      ErrorManager.createRestNotFoundError
    );
  }

  static validationToRestErrors(validationErrors = []) {
    return validationErrors.map(
      validationError =>
        new RestError(
          validationError.title,
          400,
          validationErrorToErrorDetails(validationError),
          ErrorManager.validationToRestErrors
        )
    );
  }
}

function validationErrorToErrorDetails(validationError) {
  return {
    code: validationError.type,
    title: validationError.title,
    detail: validationError.detail,
    meta: {
      property: validationError.property,
      value: validationError.value,
    },
  };
}
