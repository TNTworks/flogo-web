import { flowToJSON_Link } from './backend/legacy';
import { RunTaskStatusCode } from '../services/restapi';

export interface StepAttribute {
  [taskAttribute: string]: any;
}

export interface TaskChange {
  status: RunTaskStatusCode;
}

export interface TaskChanges {
  [taskId: string]: TaskChange;
}

export interface Step {
  flowChanges: {
    [flowType: string]: {
      status: number;
      attrs: StepAttribute | null;
      tasks: TaskChanges;
    };
  };
  id: number;
  flowId: string;
}

export interface Snapshot {
  // todo
  attrs: any[];
  flowUri: string;
  id: string;
  rootTaskEnv: RootTaskEnv;
  state: number;
  status: number;
  workQueue: WorkQueueItem[];
}

export interface RootTaskEnv {
  id?: number;
  taskId?: number;
  // todo: detail instead of any
  linkDatas?: flowToJSON_Link[];
  taskDatas?: TaskDatum[];
}

export interface WorkQueueItem {
  id: number;
  taskID: number;
  code: number;
  execType: number;
}

export interface TaskDatum {
  // tod: detail instead of any
  taskId: number;
  done: boolean;
  state: number;
  // todo
  attrs: any[];
}

export interface InterceptorTask {
  id: string;
  inputs: Array<{
    name: string;
    type: string;
    value: any;
  }>;
}

export interface Interceptor {
  tasks: InterceptorTask[];
}
