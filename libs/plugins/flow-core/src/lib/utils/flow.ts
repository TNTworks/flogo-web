import { get } from 'lodash';
import { TASK_HANDLER_NAME_ROOT } from '../constants';

export function safeGetTasksInHandler(action, handler) {
  return get(action, getInternalTasksPath(handler), []);
}

export function getInternalTasksPath(handler) {
  if (handler === TASK_HANDLER_NAME_ROOT) {
    return 'tasks';
  }
  return `${handler}.tasks`;
}
