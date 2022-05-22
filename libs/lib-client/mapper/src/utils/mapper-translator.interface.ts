import {
  AttributeDescriptor,
  Mappings,
  MapperSchema,
  Properties as MapperSchemaProperties,
} from '@flogo-web/lib-client/mapper';
import { Dictionary } from '@flogo-web/lib-client/core';

export type MappingsValidatorFn = (mappings: Mappings) => boolean;

export interface IMapperTranslator {
  createOutputSchema(
    tiles,
    additionalSchemas?: MapperSchemaProperties,
    includeEmptySchemas?: boolean
  ): MapperSchema;

  attributesToObjectDescriptor(
    attributes: AttributeDescriptor[],
    additionalProps?: { [key: string]: any }
  ): MapperSchema;

  translateMappingsIn(inputMappings: any);

  rawExpressionToString(rawExpression: any, inputType: number);

  translateMappingsOut(mappings: {
    [attr: string]: { expression: string; mappingType?: number };
  }): Dictionary<any>;

  parseExpression(expression: string);

  getRootType(tile): string;

  makeValidator(): MappingsValidatorFn;

  isValidExpression(expression: any): boolean;
}
