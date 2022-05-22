import { MapExpression, MapperContext } from '../models';

export class StaticMapperContextFactory {
  static create(
    inputSchemas: any,
    outputSchemas: any,
    mappings: { [lhs: string]: MapExpression },
    functions: any
  ): MapperContext {
    return {
      mappings,
      outputSchemas,
      inputSchemas,
      functions,
    };
  }
}
