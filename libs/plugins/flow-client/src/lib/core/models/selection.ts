import { HandlerType } from './handler-type';

export enum SelectionType {
  InsertTask = 'insertTask',
  Task = 'task',
  Trigger = 'trigger',
}

export type CurrentSelection = TaskSelection | InsertTaskSelection | TriggerSelection;

export interface TaskSelection {
  type: SelectionType.Task;
  taskId: string;
  handlerType?: HandlerType;
}

export interface InsertTaskSelection {
  type: SelectionType.InsertTask;
  parentId: string;
  handlerType: HandlerType;
}

export interface TriggerSelection {
  type: SelectionType.Trigger;
  triggerId: string;
}
