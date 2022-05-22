import {
  SchemaSettingAttributeDescriptor as SchemaAttribute,
  TriggerSchema,
} from '@flogo-web/core';
import { Dictionary, Trigger, TriggerHandler } from '@flogo-web/lib-client/core';
import { ConfigureTriggerDetails } from '../../../../triggers/configurator/interfaces';

export function createTriggerConfigureFields(
  triggerInstance: Trigger,
  handlerInstance: TriggerHandler,
  schema: TriggerSchema
): ConfigureTriggerDetails['fields'] {
  const { name, description, settings: common } = triggerInstance;
  const { settings: handlerSettings } = handlerInstance;
  const { settings: triggerSettingsSchema, handler } = schema;
  const { settings: handlerSettingsSchema } = handler;
  return {
    settings: {
      name: createField(name),
      description: createField(description),
      triggerSettings: groupBySettings(triggerSettingsSchema || [], common),
      handlerSettings: groupBySettings(handlerSettingsSchema || [], handlerSettings),
    },
    streamInputMappings: null,
    streamOutputMappings: null,
  };
}

function mergeSettingsWithSchema(schemaAttributes, instanceProperties) {
  return schemaAttributes
    .map(schemaAttribute => {
      return [schemaAttribute.name, instanceProperties[schemaAttribute.name]];
    })
    .reduce((props, [name, value]) => {
      props[name] = value;
      return props;
    }, {});
}

function groupBySettings(schema: SchemaAttribute[], instanceProperties: Dictionary<any>) {
  const mergedSettings = mergeSettingsWithSchema(schema, instanceProperties);
  return Object.keys(mergedSettings).reduce((props, name) => {
    props[name] = createField(mergedSettings[name]);
    return props;
  }, {});
}

function createField(value) {
  return {
    isDirty: false,
    isValid: true,
    isEnabled: true,
    value,
  };
}
