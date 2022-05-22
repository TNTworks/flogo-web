import { fromPairs } from 'lodash';
import { ActivitySchema } from '@flogo-web/core';
import { Task as BackendTask, Link as BackendLink } from '@flogo-web/plugins/flow-core';

import { ItemFactory } from './item-factory';

export function makeTaskItems(
  tasks: BackendTask[],
  getActivitySchema: (task) => Partial<ActivitySchema>
) {
  return fromPairs(
    tasks.map(task => [task.id, makeTaskItem(task, getActivitySchema(task))])
  );
}

export function makeBranchItem(id: string, link: BackendLink) {
  return ItemFactory.makeBranch({ taskID: id, condition: link.value });
}

export function makeTaskItem(task: BackendTask, schema: Partial<ActivitySchema>) {
  return ItemFactory.makeItem({ taskInstance: task, activitySchema: schema });
}
