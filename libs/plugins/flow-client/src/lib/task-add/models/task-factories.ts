import { assign, cloneDeep, each, isUndefined, get } from 'lodash';
import { isMapperActivity } from '@flogo-web/plugins/flow-core';
import { FLOGO_TASK_TYPE } from '../../core';
import { portAttribute } from '../../core/utils';

export function activitySchemaToTask(schema: any): any {
  const task: any = {
    type: FLOGO_TASK_TYPE.TASK,
    activityType: get(schema, 'name', ''),
    ref: schema.ref,
    name: get(schema, 'title', get(schema, 'name', 'Activity')),
    version: get(schema, 'version', ''),
    description: get(schema, 'description', ''),
    homepage: get(schema, 'homepage', ''),
    attributes: {
      inputs: cloneDeep(get(schema, 'inputs', [])),
      outputs: cloneDeep(get(schema, 'outputs', [])),
    },
    return: schema.return,
  };

  if (!isMapperActivity(schema)) {
    task.inputMappings = get(schema, 'inputs', [])
      .filter(attribute => !isUndefined(attribute.value))
      .reduce((inputs, attribute) => {
        inputs[attribute.name] = attribute.value;
        return inputs;
      }, {});
  }

  each(task.attributes.inputs, (input: any) => {
    // convert to task enumeration and provision default types
    assign(input, portAttribute(input, true));
  });

  each(task.attributes.outputs, (output: any) => {
    // convert to task enumeration and provision default types
    assign(output, portAttribute(output));
  });

  return task;
}

export function createSubFlowTask(schema: any) {
  return {
    type: FLOGO_TASK_TYPE.TASK_SUB_PROC,
    name: get(schema, 'title', get(schema, 'name', 'Start a Subflow')),
    ref: schema.ref,
    version: '',
    description: get(schema, 'description', ''),
    homepage: '',
    attributes: {
      inputs: [],
      outputs: [],
    },
    return: false,
  };
}
