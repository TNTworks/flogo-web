import { isEmpty, pick, fromPairs } from 'lodash';
import { Dictionary } from '@flogo-web/lib-client/core';
import { StreamMetadata } from '@flogo-web/plugins/stream-core';

import { Item } from '../interfaces';
import { FlogoStreamState } from './stream.state';
import { ROOT_TYPES } from '../constants';

/**
 * When stream schema's output change we need to remove the task mappings that were referencing them
 * @param state {FlogoStreamState} stream state
 * @param metadata {StreamMetadata} update stream metadata
 */
export function cleanDanglingTaskOutputMappings(
  state: FlogoStreamState,
  metadata: StreamMetadata
) {
  let outputNames = metadata && metadata.output ? metadata.output.map(o => o.name) : [];

  outputNames = outputNames.map(prependPipeline);

  const cleanItems = itemCleaner(outputNames);

  const mainItems = cleanItems(state.mainItems);
  state = { ...state, mainItems };

  return state;
}

function itemCleaner(
  outputNames: string[]
): (items: Dictionary<Item>) => Dictionary<Item> {
  const hasMapping = ([taskId, task]: [string, Item]) => {
    return !isEmpty(task.output);
  };
  return (items: Dictionary<Item>) => cleanTasks(items, outputNames, hasMapping);
}

function cleanTasks(
  items: Dictionary<Item>,
  outputNames: string[],
  shouldClean: ([taskId, task]: [string, Item]) => boolean
): Dictionary<Item> {
  const changed: Array<[string, Item]> = Object.entries(items)
    .filter(shouldClean)
    .map(([taskId, task]: [string, Item]) => {
      const taskOutputs = Object.keys(task.output || {}) || [];
      const nonPipelineOutputs = taskOutputs.filter(
        output => output.split('.')[0] !== ROOT_TYPES.PIPELINE
      );
      return [
        taskId,
        {
          ...task,
          output: {
            ...pick(task.output, nonPipelineOutputs),
            ...pick(task.output, outputNames),
          },
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

function prependPipeline(outputName: string) {
  return `${ROOT_TYPES.PIPELINE}.${outputName}`;
}
