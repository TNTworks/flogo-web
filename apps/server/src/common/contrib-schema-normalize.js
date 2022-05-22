import get from 'lodash/get';
import set from 'lodash/set';
import isArray from 'lodash/isArray';
import { normalizeValueType } from './utils/value-type';

const normalizeValueTypeInObject = obj => ({
  ...obj,
  type: normalizeValueType(obj.type),
});
const normalizeCollectionValueTypes = collection =>
  collection.map(normalizeValueTypeInObject);

export function normalizeContribSchema(schema) {
  // change to "old" name to support new definition without affecting the rest of the application
  // (inputs => input) and (outputs => output)
  if (schema.input) {
    schema.inputs = schema.input;
    delete schema.input;
  }
  if (schema.output) {
    schema.outputs = schema.output;
    delete schema.output;
  }
  const propertiesWithValueTypes = [
    'inputs',
    'outputs',
    'settings',
    'reply',
    'handler.settings',
  ];
  propertiesWithValueTypes.forEach(property => {
    const propertyValue = get(schema, property, null);
    if (propertyValue && isArray(propertyValue)) {
      set(schema, property, normalizeCollectionValueTypes(propertyValue));
    }
  });
  return schema;
}
