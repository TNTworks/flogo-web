import Ajv from 'ajv';
import { Validator } from './validator';

/**
 * @param schema
 * @param options
 * @return {Validator}
 */
export function validatorFactory(schema, options = {}) {
  const defaultOptions = {
    removeAdditional: true,
    useDefaults: true,
    allErrors: true,
  };
  const ajv = new Ajv({ ...defaultOptions, ...options });
  return new Validator(schema, ajv);
}
