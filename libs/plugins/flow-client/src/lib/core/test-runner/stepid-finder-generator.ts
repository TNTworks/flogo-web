import { Step, StepFlowType } from '@flogo-web/lib-client/core';
import { taskIdsOfCurrentStep } from './taskids-current-step';
import { flatten } from 'lodash';

/***
 * A task will be executed in only one step. This function helps to find the ID of the step in which a task is executed or marked done.
 * @param steps
 */
export function generateStepIdFinder(steps: Step[]): (string) => number {
  const taskIdStepsRegistry = new Map<string, number>(
    flatten(
      steps.map(step => {
        const mainFlowChanges = step.flowChanges[StepFlowType.MainFlow];
        const executedTasks = taskIdsOfCurrentStep(mainFlowChanges.tasks);
        return executedTasks.map(id => [id, step.id]);
      })
    )
  );
  return (taskId: string) => {
    return taskIdStepsRegistry.get(taskId);
  };
}
