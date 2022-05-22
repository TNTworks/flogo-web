import { Mappings } from './mappings';

export interface MapperContext {
  id?: string;
  mappings: Mappings;
  inputSchemas: any;
  outputSchemas: any;
  functions: any;
}
