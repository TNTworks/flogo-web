import { get, isEmpty } from 'lodash';

import { FlowState } from '../state';
import { MetadataAttribute } from '../interfaces';
import { RunOptions } from './run-orchestrator.service';
import { Dictionary } from '@flogo-web/lib-client/core';

export function createRunOptionsForRoot(flowState: FlowState) {
  const initData = getInitDataForRoot(flowState);
  const runOptions: RunOptions = { attrsData: initData };
  const shouldUpdateFlow =
    flowState.configChangedSinceLastExecution || !flowState.lastFullExecution.processId;
  if (shouldUpdateFlow) {
    runOptions.useFlowId = flowState.id;
  } else {
    runOptions.useProcessId = flowState.lastFullExecution.processId;
  }
  return runOptions;
}

function getInitDataForRoot(flowState: FlowState): Dictionary<any> | undefined {
  const flowInput = get(flowState, 'metadata.input') as MetadataAttribute[];
  if (isEmpty(flowInput)) {
    return undefined;
  }
  return flowInput.reduce((accumulateInput, input) => {
    accumulateInput[input.name] = input.value;
    return accumulateInput;
  }, {});
}
