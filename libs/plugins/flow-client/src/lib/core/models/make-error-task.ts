import { ValueType } from '@flogo-web/core';
import { Task } from '../interfaces';
import { FLOGO_ERROR_ROOT_NAME, FLOGO_TASK_TYPE } from '../constants';

export function makeErrorTask(): Task {
  return {
    id: '',
    name: 'On Error',
    // title: 'On Error',
    type: FLOGO_TASK_TYPE.TASK_ROOT,
    triggerType: FLOGO_ERROR_ROOT_NAME,
    attributes: {
      outputs: [
        {
          name: 'activity',
          type: ValueType.String,
          title: 'activity',
          value: '',
        },
        {
          name: 'message',
          type: ValueType.String,
          title: 'message',
          value: '',
        },
        {
          name: 'data',
          type: ValueType.Any,
          title: 'data',
          value: '',
        },
        {
          name: 'code',
          type: ValueType.String,
          title: 'code',
          value: '',
        },
      ],
    },
  };
}
