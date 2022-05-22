export const EXPORT_MODE = {
  STANDARD_MODEL: 'standard',
  LEGACY_MODEL: 'legacy',
  FORMAT_FLOWS: 'flows',
};

export const APP_MODEL_VERSION = '1.1.0';

export const FLOGO_TASK_ATTRIBUTE_TYPE = {
  STRING: 'string',
  INTEGER: 'integer',
  LONG: 'long',
  DOUBLE: 'double',
  BOOLEAN: 'boolean',
  OBJECT: 'object',
  ARRAY: 'array',
  PARAMS: 'params',
  ANY: 'any',
  BYTES: 'bytes',
  DATETIME: 'datetime',
  CONNECTION: 'connection',
};

export const TYPE_UNKNOWN = 'unknown';

export const DEFAULT_APP_VERSION = '0.0.1';
export const DEFAULT_APP_TYPE = 'flogo:app';

// The below constant must be in sync with the client side TYPE_LITERAL_ASSIGNMENT
// [src/client/flogo/flow/shared/mapper/constants.ts]
export const TYPE_LITERAL_ASSIGNMENT = 2;
