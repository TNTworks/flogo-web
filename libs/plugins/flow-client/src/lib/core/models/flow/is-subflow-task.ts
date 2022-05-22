import { FLOGO_TASK_TYPE } from '../../constants';

export function isSubflowTask(taskType: FLOGO_TASK_TYPE): boolean {
  return taskType === FLOGO_TASK_TYPE.TASK_SUB_PROC;
}
