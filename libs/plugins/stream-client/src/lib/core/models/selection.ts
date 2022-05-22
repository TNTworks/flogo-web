export enum SelectionType {
  InsertTask = 'insertTask',
  Task = 'task',
  Trigger = 'trigger',
}

export type CurrentSelection = TaskSelection | InsertTaskSelection | TriggerSelection;

export interface TaskSelection {
  type: SelectionType.Task;
  taskId: string;
}

export interface InsertTaskSelection {
  type: SelectionType.InsertTask;
  parentId: string;
}

export interface TriggerSelection {
  type: SelectionType.Trigger;
  triggerId: string;
}
