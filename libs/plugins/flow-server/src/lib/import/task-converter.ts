import { isUndefined, isArray, isPlainObject } from 'lodash';

import { EXPR_PREFIX, CONTRIB_REFS } from '@flogo-web/core';
import {
  TASK_TYPE,
  EXPRESSION_TYPE,
  parseResourceIdFromResourceUri,
  transformConnectionTypeSettings,
} from '@flogo-web/lib-server/core';
import {
  isMapperActivity,
  FLOGO_TASK_TYPE,
  FlowResourceModel,
} from '@flogo-web/plugins/flow-core';
import { normalizeIteratorValue } from './normalize-iterator-value';

const isStandardMappings = (activity: FlowResourceModel.NewActivity) => {
  return (
    activity.settings &&
    activity.settings.mappings &&
    isPlainObject(activity.settings.mappings)
  );
};

const isLegacyMappings = (activity: FlowResourceModel.LegacyActivity) => {
  return activity.input && activity.input.mappings && isArray(activity.input.mappings);
};

const isLegacySubFlow = (activity: FlowResourceModel.LegacyActivity) => {
  return !!activity.mappings;
};

const normalizeMappingValue = (value: any, mappingType?: string) => {
  if (isUndefined(value)) {
    return value;
  }

  if (mappingType && mappingType !== EXPRESSION_TYPE.LITERAL && !isPlainObject(value)) {
    // mappingType is passed for the case of old mappings structure ({mapTo, type: MappingType, value})
    value = EXPR_PREFIX + value;
  }
  return value;
};

export class TaskConverter {
  private resourceTask;
  private activitySchema;

  constructor(resourceTask, activitySchema) {
    if (!resourceTask) {
      throw new TypeError('Missing parameter: resourceTask');
    }
    if (!activitySchema) {
      throw new TypeError('Missing parameter: activitySchema');
    }
    this.resourceTask = resourceTask;
    this.activitySchema = activitySchema;
  }

  convert(importsRefAgent) {
    const {
      id,
      name,
      description,
      activity: { ref: activityRef },
    } = this.resourceTask;
    const { type, settings, activitySettings } = this.resolveTypeAndSettings(
      importsRefAgent
    );
    const inputMappings = this.prepareInputMappings();
    return {
      id,
      name: name,
      description: description || '',
      type,
      activityRef,
      settings,
      inputMappings,
      activitySettings,
    };
  }

  resolveTypeAndSettings(importsRefAgent) {
    const settings: { [key: string]: any } = {};
    let activitySettings: { [settingName: string]: any } = {};
    let type = FLOGO_TASK_TYPE.TASK;
    if (this.isSubflowTask()) {
      type = FLOGO_TASK_TYPE.TASK_SUB_PROC;
      settings.flowPath = this.extractSubflowPath();
    } else if (!isMapperActivity(this.activitySchema)) {
      activitySettings = this.resourceTask.activity.settings;
      if (activitySettings) {
        activitySettings = transformConnectionTypeSettings(
          activitySettings,
          this.activitySchema?.settings,
          importsRefAgent,
          true
        );
      }
    }
    if (this.isIteratorTask()) {
      settings.iterate = normalizeIteratorValue(this.resourceTask.settings.iterate);
    }
    return { type, settings, activitySettings };
  }

  prepareInputMappings() {
    if (isMapperActivity(this.activitySchema)) {
      return this.getInputMappingsForMapperContribs();
    } else if (this.isSubflowTask()) {
      return this.getInputMappingsForSubFlowContrib();
    } else {
      return this.getInputMappingsForNormalContribs();
    }
  }

  private extractSubflowPath() {
    const activitySettings = this.resourceTask.activity.settings;
    return parseResourceIdFromResourceUri(activitySettings.flowURI);
  }

  private isSubflowTask() {
    return this.resourceTask.activity.ref === CONTRIB_REFS.SUBFLOW;
  }

  private isIteratorTask() {
    return this.resourceTask.type === TASK_TYPE.ITERATOR;
  }

  private getInputMappingsForNormalContribs() {
    const inputMappings = this.convertAttributes();
    return this.getInputMappings(inputMappings);
  }

  private safeGetMappings() {
    const mappings = this.resourceTask.activity.mappings || {};
    const { input: resourceInputMappings = [] } = mappings;
    return resourceInputMappings;
  }

  private convertAttributes() {
    // in the past schema used name `inputs` but now uses `input`, server model was using inputs
    // todo: fcastill - support input only
    const schemaInputs = this.activitySchema.input || this.activitySchema.inputs || [];
    const activityInput = this.resourceTask.activity.input || {};
    return schemaInputs.reduce((attributes, schemaInput) => {
      const value = normalizeMappingValue(activityInput[schemaInput.name]);
      if (isUndefined(value)) {
        return attributes;
      }
      attributes[schemaInput.name] = value;
      return attributes;
    }, {});
  }

  private getInputMappingsForMapperContribs() {
    let inputMappings = {};
    const activity = this.resourceTask.activity;
    if (isStandardMappings(activity)) {
      inputMappings = activity.settings.mappings || {};
    } else if (isLegacyMappings(activity)) {
      inputMappings = activity.input.mappings.reduce((mapping, outputMapping) => {
        const value = normalizeMappingValue(outputMapping.value, outputMapping.type);
        if (isUndefined(value)) {
          return mapping;
        }
        mapping[outputMapping.mapTo] = value;
        return mapping;
      }, {});
    }
    return inputMappings;
  }

  private getInputMappingsForSubFlowContrib() {
    if (isLegacySubFlow(this.resourceTask.activity)) {
      return this.getInputMappings();
    } else {
      return this.resourceTask.activity.input || {};
    }
  }

  private getInputMappings(inputMappings = {}) {
    return this.safeGetMappings().reduce((inputs, mapping) => {
      const value = normalizeMappingValue(mapping.value, mapping.type);
      if (isUndefined(value)) {
        return inputs;
      }
      inputs[mapping.mapTo] = value;
      return inputs;
    }, inputMappings);
  }
}
