import { MapperContext } from './mapper-context';
import { IMapperResult } from './imapper-result';

/**
 * Map Context validator responsible for
 * validating mapping LHS and RHS expressions
 */
export interface IMapContextValidator {
  validate(context: MapperContext): IMapperResult;
}
