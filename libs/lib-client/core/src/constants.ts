/**
 * Enumerations
 */

export enum FLOGO_CONTRIB_TYPE {
  TRIGGER = 'trigger',
  ACTIVITY = 'activity',
  FUNCTION = 'function',
}

export const ERROR_CODE = {
  REQUIRED: 'RequiredProperty',
  UNIQUE: 'UniqueValue',
  NOT_INSTALLED_TRIGGER: 'notInstalledTrigger',
  NOT_INSTALLED_ACTIVITY: 'notInstalledActivity',
  WRONG_INPUT_JSON_FILE: 'wrongInputJSONFile',
  HAS_SUBFLOW: 'HasSubflow',
};

export const ERROR_CONSTRAINT = {
  NOT_UNIQUE: 'notUnique',
  NOT_INSTALLED_TRIGGER: 'notInstalledTrigger',
  NOT_INSTALLED_ACTIVITY: 'notInstalledActivity',
  WRONG_INPUT_JSON_FILE: 'wrongInputJSONFile',
};

export enum TASK_TYPE {
  TASK = 1,
  TASK_ITERATOR = 2,
  TASK_BRANCH,
  TASK_SUB_PROC,
}
