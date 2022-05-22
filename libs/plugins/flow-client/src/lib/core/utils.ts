import { get, assign, each, isUndefined } from 'lodash';
import { getDefaultValue } from '@flogo-web/lib-client/core';
import { FLOGO_TASK_TYPE } from './constants';

export function portAttribute(
  inAttr: {
    type: string;
    value: any;
    [key: string]: any;
  },
  withDefault = false
) {
  const outAttr = <
    {
      type: any;
      value: any;
      [key: string]: any;
    }
  >assign({}, inAttr);

  if (withDefault && isUndefined(outAttr.value)) {
    outAttr.value = getDefaultValue(outAttr.type);
  }

  return outAttr;
}

export function activitySchemaToTrigger(schema: any): any {
  const trigger: any = {
    type: FLOGO_TASK_TYPE.TASK_ROOT,
    triggerType: get(schema, 'name', ''),
    ref: schema.ref,
    name: get(schema, 'title', get(schema, 'name', 'Activity')),
    version: get(schema, 'version', ''),
    description: get(schema, 'description', ''),
    homepage: get(schema, 'homepage', ''),
    settings: get(schema, 'settings', ''),
    outputs: get(schema, 'outputs', ''),
    handler: { settings: get(schema, 'handler.settings', []) }, // ,
    // __schema: cloneDeep(schema)
  };

  each(trigger.inputs, (input: any) => {
    // convert to task enumeration and provision default types
    assign(input, portAttribute(input, true));
  });

  each(trigger.outputs, (output: any) => {
    // convert to task enumeration and provision default types
    assign(output, portAttribute(output));
  });

  return trigger;
}
