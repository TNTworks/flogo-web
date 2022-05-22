import { reduce } from 'lodash';
import { TaskChanges, TaskChange, RunTaskStatusCode } from '@flogo-web/lib-client/core';

export function taskIdsOfCurrentStep(tasks: TaskChanges): string[] {
  return reduce(
    tasks,
    (taskIds: string[], task: TaskChange, taskId: string) => {
      if (
        task.status === RunTaskStatusCode.Done ||
        task.status === RunTaskStatusCode.Failed
      ) {
        taskIds.push(taskId);
      }
      return taskIds;
    },
    []
  );
}
