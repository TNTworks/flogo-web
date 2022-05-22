import { ValueType, Metadata } from '@flogo-web/core';

export function parseMetadata(metadata: Metadata): Metadata {
  const resourceMetadata: Metadata = {} as Metadata;
  if (metadata.input) {
    resourceMetadata.input = metadata.input.map(input => ({
      name: input.name,
      type: input.type || ValueType.String,
    }));
  }
  if (metadata.output) {
    resourceMetadata.output = metadata.output.map(output => ({
      name: output.name,
      type: output.type || ValueType.String,
    }));
  }
  return resourceMetadata;
}
