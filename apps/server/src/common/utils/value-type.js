import { FLOGO_TASK_ATTRIBUTE_TYPE } from '../constants';

export function normalizeValueType(type) {
  type = type ? type.toLowerCase() : null;
  switch (type) {
    case 'any':
      return FLOGO_TASK_ATTRIBUTE_TYPE.ANY;
    case 'string':
      return FLOGO_TASK_ATTRIBUTE_TYPE.STRING;
    case 'integer':
    case 'int':
      return FLOGO_TASK_ATTRIBUTE_TYPE.INTEGER;
    case 'long':
      return FLOGO_TASK_ATTRIBUTE_TYPE.LONG;
    case 'double':
    case 'number':
      return FLOGO_TASK_ATTRIBUTE_TYPE.DOUBLE;
    case 'boolean':
    case 'bool':
      return FLOGO_TASK_ATTRIBUTE_TYPE.BOOLEAN;
    case 'object':
      return FLOGO_TASK_ATTRIBUTE_TYPE.OBJECT;
    case 'bytes':
      return FLOGO_TASK_ATTRIBUTE_TYPE.BYTES;
    case 'array':
      return FLOGO_TASK_ATTRIBUTE_TYPE.ARRAY;
    case 'params':
      return FLOGO_TASK_ATTRIBUTE_TYPE.PARAMS;
    case 'datetime':
      return FLOGO_TASK_ATTRIBUTE_TYPE.DATETIME;
    case 'connection':
      return FLOGO_TASK_ATTRIBUTE_TYPE.CONNECTION;
    default:
      return FLOGO_TASK_ATTRIBUTE_TYPE.ANY;
  }
}
