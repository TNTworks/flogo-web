import {
  CurrentSelection,
  SelectionType,
  TriggerSelection,
  InsertTaskSelection,
  TaskSelection,
} from '../selection';

export function makeInsertSelection(parentId: string): InsertTaskSelection {
  return {
    type: SelectionType.InsertTask,
    parentId,
  };
}

export function makeStageSelection(taskId: string): TaskSelection {
  return {
    type: SelectionType.Task,
    taskId,
  };
}

export function isTriggerSelection(
  selection: null | CurrentSelection
): selection is TriggerSelection {
  return selection && selection.type === SelectionType.Trigger;
}
