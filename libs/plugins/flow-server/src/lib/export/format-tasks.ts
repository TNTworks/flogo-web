import {
  ContributionSchema,
  CONTRIB_REFS,
  Resource,
  ActivitySchema,
} from '@flogo-web/core';
import { ExportRefAgent } from '@flogo-web/lib-server/core';
import { isMapperActivity, isSubflowTask } from '@flogo-web/plugins/flow-core';
import { TaskFormatter } from './task-formatter';

export function formatTasks(
  tasks = [],
  contributions: Map<string, ContributionSchema>,
  resourceIdReconciler: Map<string, Resource>,
  refAgent: ExportRefAgent
) {
  const taskFormatter = new TaskFormatter(resourceIdReconciler, refAgent);
  return tasks.map(task => {
    if (isSubflowTask(task)) {
      task = { ...task, activityRef: CONTRIB_REFS.SUBFLOW };
    }
    const contributionSchema = contributions.get(task.activityRef);
    const isMapperType = isMapperActivity(contributionSchema);
    return taskFormatter
      .setSourceTask(task)
      .convert(isMapperType, <ActivitySchema>contributionSchema);
  });
}
