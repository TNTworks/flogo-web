import { Resource } from '@flogo-web/core';
import { Dictionary, StepAttribute, TriggerHandler } from '@flogo-web/lib-client/core';
import { CurrentSelection } from '../../models';
import { Trigger, TriggerConfigureState, UiFlow } from '../../interfaces';

export interface FlowState extends UiFlow {
  isErrorPanelOpen: boolean;
  isDebugPanelOpen: boolean;
  currentSelection: null | CurrentSelection;
  triggers: Dictionary<Trigger>;
  handlers: Dictionary<TriggerHandler>;
  triggerConfigure: TriggerConfigureState;
  linkedSubflows: Dictionary<Resource>;
  taskConfigure: string | null;
  configChangedSinceLastExecution: boolean;
  structureChangedSinceLastFullExecution: boolean;
  lastFullExecution: {
    processId: string;
    instanceId: string;
  };
  lastExecutionResult: { [taskId: string]: Dictionary<StepAttribute> };
}

export interface State {
  flow: FlowState;
}

export const INITIAL_STATE: FlowState = {
  app: null,
  mainItems: null,
  mainGraph: null,
  errorItems: null,
  errorGraph: null,
  currentSelection: null,
  isErrorPanelOpen: false,
  isDebugPanelOpen: false,
  schemas: {},
  handlers: {},
  triggers: {},
  linkedSubflows: {},
  triggerConfigure: null,
  taskConfigure: null,
  lastFullExecution: {
    processId: null,
    instanceId: null,
  },
  configChangedSinceLastExecution: false,
  structureChangedSinceLastFullExecution: false,
  lastExecutionResult: {},
};
