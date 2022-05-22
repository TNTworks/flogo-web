import { InstalledFunctionSchema } from '@flogo-web/lib-client/core';
import {
  AttributeDescriptor,
  IMapperTranslator,
  StaticMapperContextFactory,
} from '../../utils';

export function createMapperContext(
  input: AttributeDescriptor[],
  output: any[],
  handlerMappings: any[],
  functions: InstalledFunctionSchema[],
  mapperTranslator: IMapperTranslator
) {
  const inputSchema = mapperTranslator.attributesToObjectDescriptor(input || []);
  const outputSchema = mapperTranslator.createOutputSchema(output || []);
  const mappings = mapperTranslator.translateMappingsIn(handlerMappings || []);
  return StaticMapperContextFactory.create(
    inputSchema,
    outputSchema,
    mappings,
    functions
  );
}
