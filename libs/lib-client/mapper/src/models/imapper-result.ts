import { IMappingError } from './imapping-error';

/**
 * Mapping Validation Result
 * A result can contain one or more errors
 */
export interface IMapperResult {
  errors: IMappingError[];

  isValid(): boolean;

  getErrors(): IMappingError[];
}
