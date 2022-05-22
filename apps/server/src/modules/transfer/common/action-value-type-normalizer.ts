import { normalizeValueType } from '../../../common/utils/value-type';

const normalizeAttrType = attr => ({
  ...attr,
  type: normalizeValueType(attr.type),
});

export function actionValueTypesNormalizer(action) {
  if (!action) {
    return action;
  }
  if (action.metadata) {
    action.metadata = normalizeMetadataValueTypes(action.metadata);
  }

  return action;
}

function normalizeMetadataValueTypes(metadata) {
  if (metadata.input) {
    metadata.input = metadata.input.map(normalizeAttrType);
  }
  if (metadata.output) {
    metadata.output = metadata.output.map(normalizeAttrType);
  }
  return metadata;
}
