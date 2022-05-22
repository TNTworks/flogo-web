import { Resource, StreamSimulation } from '@flogo-web/core';
import { StreamData } from '@flogo-web/plugins/stream-core';

export function checkSimulationConfig(resource: Resource<StreamData>) {
  const simulationConfig = resource.data && resource.data.simulation;
  if (!simulationConfig) {
    return resource;
  }

  const inputMappingType = simulationConfig.inputMappingType;
  if (inputMappingType && !isValidMappingType(inputMappingType)) {
    delete simulationConfig.inputMappingType;
  }

  return resource;
}

function isValidMappingType(val: any): val is StreamSimulation.InputMappingType {
  return Object.values(StreamSimulation.InputMappingType).includes(val);
}
