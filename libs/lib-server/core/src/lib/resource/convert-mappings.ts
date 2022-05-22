import { typeMapper } from '../flow/type-mapper';

export function portMappings(
  mappingTypesDictionary,
  mappings: { input?: any; output?: any } = {}
) {
  const convertSingleMapping = mapping =>
    portMappingType(mappingTypesDictionary, mapping);
  return {
    input: (mappings.input || []).map(convertSingleMapping),
    output: (mappings.output || []).map(convertSingleMapping),
  };
}

export function portMappingType(mappingTypesDictionary, mapping) {
  return {
    ...mapping,
    type: mappingTypesDictionary[mapping.type],
  };
}

export const fromStandardTypeMapper = typeMapper.fromStandard();
export const convertMappingsCollectionToStandard = mappings =>
  portMappings(fromStandardTypeMapper.mappingTypes, mappings);
