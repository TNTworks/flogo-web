import { assign, cloneDeep, each, get } from 'lodash';

import { FLOGO_TASK_TYPE } from '../../core';
import { portAttribute } from '../../core/utils';

export function activitySchemaToStage(schema: any): any {
  const stage: any = {
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

  /**
   * streams-plugin-todo: Reintroduce the logic to append default value properties to the stage's inputMappings
   */
  /*if (!isMapperActivity(schema)) {
    stage.inputMappings = get(schema, 'inputs', [])
      .filter(attribute => !isUndefined(attribute.value))
      .reduce((inputs, attribute) => {
        inputs[attribute.name] = attribute.value;
        return inputs;
      }, {});
  }*/

  each(stage.attributes.inputs, (input: any) => {
    // convert to stage enumeration and provision default types
    assign(input, portAttribute(input, true));
  });

  each(stage.attributes.outputs, (output: any) => {
    // convert to stage enumeration and provision default types
    assign(output, portAttribute(output));
  });

  return stage;
}
