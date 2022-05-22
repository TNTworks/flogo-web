import { CONTRIB_REFS } from '@flogo-web/core';
import { safeGetTasksInHandler } from './flow';
import {
  TASK_HANDLER_NAME_ERROR,
  TASK_HANDLER_NAME_ROOT,
  FLOGO_TASK_TYPE,
} from '../constants';

export function actionHasSubflowTasks(action) {
  return (
    !!safeGetTasksInHandler(action, TASK_HANDLER_NAME_ROOT).find(isSubflowTask) ||
    !!safeGetTasksInHandler(action, TASK_HANDLER_NAME_ERROR).find(isSubflowTask)
  );
}

export function isSubflowTask(task) {
  return (
    task.type === FLOGO_TASK_TYPE.TASK_SUB_PROC ||
    task.activityRef === CONTRIB_REFS.SUBFLOW
  );
}

/**
 *
 * @param action
 * @param {Function} onSubflowTask
 */
export function forEachSubflowTaskInAction(action, onSubflowTask) {
  const iterateOn = taskArray =>
    taskArray.filter(isSubflowTask).forEach(task => onSubflowTask(task));
  iterateOn(safeGetTasksInHandler(action, TASK_HANDLER_NAME_ROOT));
  iterateOn(safeGetTasksInHandler(action, TASK_HANDLER_NAME_ERROR));
}
