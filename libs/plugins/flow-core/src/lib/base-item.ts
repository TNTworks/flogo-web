import { FLOGO_TASK_TYPE } from './constants';

export interface BaseItem {
  id: string;
  type: FLOGO_TASK_TYPE;
  name?: string;
}
