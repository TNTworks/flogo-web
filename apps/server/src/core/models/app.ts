import { App } from '@flogo-web/core';
import { APP_MODEL_VERSION } from '../../common/constants';

export function constructApp(inputData, generateId?: () => string): App {
  const now = new Date().toISOString();
  return {
    ...inputData,
    id: inputData.id || generateId(),
    name: inputData.name.trim(),
    createdAt: now,
    updatedAt: null,
    appModel: APP_MODEL_VERSION,
    triggers: [],
    resources: [],
    imports: inputData.imports || [],
  };
}
