import { isEmpty } from 'lodash';

import {
  createResourceUri,
  Resource,
  MapperUtils,
  ContributionType,
  ActivitySchema,
} from '@flogo-web/core';
import {
  TASK_TYPE,
  ExportRefAgent,
  transformConnectionTypeSettings,
} from '@flogo-web/lib-server/core';
import { Task, isSubflowTask, isIterableTask } from '@flogo-web/plugins/flow-core';

interface Mappings {
  [propertyName: string]: string;
}

const createFnAccumulator = (registerFunction: (string) => void) => {
  return (mappings: Mappings) => {
    MapperUtils.functions
      .parseAndExtractReferencesInMappings(mappings || {})
      .forEach(registerFunction);
  };
};

export class TaskFormatter {
  private sourceTask: Task;
  readonly accumulateFunctions: (mappings: Mappings) => void;

  constructor(
    private resourceIdReconciler: Map<string, Resource>,
    private refAgent: ExportRefAgent
  ) {
    this.accumulateFunctions = createFnAccumulator(
      refAgent.registerFunctionName.bind(refAgent)
    );
  }

  setSourceTask(sourceTask) {
    this.sourceTask = sourceTask;
    return this;
  }

  convert(isMapperType: boolean, contributionSchema: ActivitySchema) {
    const { id, name, description, activityRef } = this.sourceTask;
    const {
      type,
      taskSettings,
      activitySettings,
      input,
    } = this.resolveActivityProperties(isMapperType);
    const task = {
      id,
      type,
      name: !isEmpty(name) ? name : undefined,
      description: !isEmpty(description) ? description : undefined,
      settings: !isEmpty(taskSettings) ? taskSettings : undefined,
      activity: {
        ref: this.refAgent.getAliasRef(ContributionType.Activity, activityRef),
        input: !isEmpty(input) ? input : undefined,
        settings: !isEmpty(activitySettings) ? activitySettings : undefined,
      },
    };
    const taskActivitySettings = task.activity.settings;
    if (taskActivitySettings) {
      task.activity.settings = transformConnectionTypeSettings(
        taskActivitySettings,
        contributionSchema?.settings,
        this.refAgent,
        false
      );
    }
    return task;
  }

  resolveActivityProperties(isMapperType) {
    const taskSettings: {
      iterate?: string;
    } = {};
    let activitySettings: {
      flowURI?: string;
      mappings?: { [flowOutput: string]: any };
    } = {};
    // for type 'standard' we will omit the 'type' property as a task is 'standard' by default
    let type;
    if (isSubflowTask(this.sourceTask)) {
      activitySettings.flowURI = this.convertSubflowPath();
    } else if (isMapperType) {
      activitySettings.mappings = this.sourceTask.inputMappings;
    } else {
      activitySettings = this.sourceTask.activitySettings;
    }

    let input = {};
    if (!isMapperType) {
      input = this.sourceTask.inputMappings;
    }
    if (this.isIteratorTask()) {
      type = TASK_TYPE.ITERATOR;
      taskSettings.iterate = this.sourceTask.settings.iterate;
    }
    this.accumulateFunctions(taskSettings);
    this.accumulateFunctions(this.sourceTask.inputMappings);
    this.accumulateFunctions(this.sourceTask.activitySettings);
    return { type, taskSettings, activitySettings, input };
  }

  convertSubflowPath() {
    const settings = this.sourceTask.settings;
    const resourceId = this.resourceIdReconciler.get(settings.flowPath).id;
    return createResourceUri(resourceId);
  }

  isIteratorTask() {
    return isIterableTask(this.sourceTask);
  }
}
