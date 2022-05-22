import { injectable } from 'inversify';
import { cloneDeep, isArray } from 'lodash';

import { StreamSimulation, MetadataAttribute, Resource } from '@flogo-web/core';
import InputMappingType = StreamSimulation.InputMappingType;

import { AppExporter } from '../apps';

const BASE_APP = {
  name: 'flogo-simulation',
  type: 'flogo:app',
  appModel: '1.1.0',
  triggers: [],
  resources: [],
};

const BASE_HANDLER_SETTINGS = {
  settings: {
    columnNameAsKey: true,
  },
};

@injectable()
export class SimulatableAppGenerator {
  constructor(private appExporter: AppExporter) {}

  async generateFor(
    resource: Resource,
    options: {
      filePath: string;
      port: string;
      emitDelay?: number;
      mappingsType?: InputMappingType;
    }
  ) {
    const opts = {
      ...options,
      emitDelay: options.emitDelay || 500,
    };
    const app = cloneDeep(BASE_APP);
    const { input: resourceInputs } = resource && resource.metadata;
    app.resources.push(resource);
    app.triggers.push(
      generateTrigger({ ...opts, resourceId: resource.id, resourceInputs })
    );
    const transformedApp = await this.appExporter.export(app);
    transformedApp.imports.push('github.com/project-flogo/stream/service/telemetry');
    return transformedApp;
  }
}

function generateTrigger(options) {
  return {
    id: 'flogo-tester',
    ref: 'github.com/project-flogo/stream/trigger/streamtester',
    settings: {
      port: options.port,
    },
    handlers: [generateHandler(options)],
  };
}

function generateHandler(options) {
  const { resourceId, filePath, emitDelay, mappingsType, resourceInputs } = options;
  const handler = cloneDeep(BASE_HANDLER_SETTINGS);
  const actionMappings = {
    input: prepareInputMappings(mappingsType, resourceInputs),
  };
  return {
    ...handler,
    settings: {
      ...handler.settings,
      emitDelay,
      filePath,
      dataAsMap: true,
      allDataAtOnce: false,
    },
    resourceId,
    actionMappings,
  };
}

function prepareInputMappings(
  mappingsType: InputMappingType,
  inputs: MetadataAttribute[]
) {
  if (!inputs || !isArray(inputs) || inputs.length < 1) {
    return;
  }

  switch (mappingsType) {
    case InputMappingType.Custom:
    case InputMappingType.SeparateByColumn:
      return inputs.reduce((mappings, attr) => {
        mappings[attr.name] = `=$.data.${attr.name}`;
        return mappings;
      }, {});
    default:
      const [input] = inputs;
      return {
        [input.name]: '=$.data',
      };
  }
}
