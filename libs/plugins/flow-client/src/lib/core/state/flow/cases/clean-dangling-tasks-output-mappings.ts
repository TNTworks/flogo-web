import { isEmpty, pick, fromPairs } from 'lodash';
import { ContributionSchema } from '@flogo-web/core';
import { Dictionary } from '@flogo-web/lib-client/core';
import { isMapperActivity } from '@flogo-web/plugins/flow-core';
import { FlowState } from '../flow.state';
import { Item, Task, ItemTask } from '../../../interfaces';

/**
 * When flow schema's output change we need to remove the task mappings that were referencing them
 * @param state
 */
export function cleanDanglingTaskOutputMappings(state: FlowState) {
  const outputNames =
    state.metadata && state.metadata.output
      ? state.metadata.output.map(o => o.name)
      : null;
  if (!outputNames) {
    return state;
  }

  const cleanItems = itemCleaner(state.schemas, outputNames);

  const mainItems = cleanItems(state.mainItems);
  if (mainItems !== state.mainItems) {
    state = { ...state, mainItems };
  }

  const errorItems = cleanItems(state.errorItems);
  if (errorItems !== state.errorItems) {
    state = { ...state, errorItems };
  }

  return state;
}

function itemCleaner(
  schemas: Dictionary<ContributionSchema>,
  outputNames: string[]
): (items: Dictionary<Item>) => Dictionary<Item> {
  const isMapperContribAndHasMapping = ([taskId, task]: [string, Task]) => {
    const schema = schemas[task.ref];
    return isMapperActivity(schema) && !isEmpty(task.inputMappings);
  };
  return (items: Dictionary<Item>) =>
    cleanTasks(items, outputNames, isMapperContribAndHasMapping);
}

function cleanTasks(
  items: Dictionary<Item>,
  outputNames: string[],
  shouldClean: ([taskId, task]: [string, Item]) => boolean
): Dictionary<Item> {
  const changed: Array<[string, Item]> = Object.entries(items)
    .filter(shouldClean)
    .map(([taskId, task]: [string, ItemTask]) => {
      return [
        taskId,
        {
          ...task,
          inputMappings: pick(task.inputMappings, outputNames),
        },
      ] as [string, Item];
    });

  if (changed.length > 0) {
    items = {
      ...items,
      ...fromPairs(changed),
    };
  }
  return items;
}
