import { StreamSimulation } from '@flogo-web/core';
import {
  BaseResourceState,
  Dictionary,
  Trigger,
  TriggerHandler,
} from '@flogo-web/lib-client/core';

import { Item, TriggerConfigureState } from '../interfaces';
import { CurrentSelection } from '../models';

export interface StreamStoreState {
  stream: FlogoStreamState;
}

export interface FlogoStreamState extends BaseResourceState<Item> {
  triggers: Dictionary<Trigger>;
  handlers: Dictionary<TriggerHandler>;
  currentSelection: null | CurrentSelection;
  triggerConfigure: TriggerConfigureState;
  stageConfigure: string | null;
  simulation: StreamSimulation.SimulationConfig | null;
  isSimulatorPanelOpen: boolean;
}

export const INITIAL_STREAM_STATE: FlogoStreamState = {
  id: null,
  name: null,
  description: null,
  app: null,
  mainItems: null,
  mainGraph: null,
  triggers: null,
  handlers: null,
  schemas: null,
  currentSelection: null,
  triggerConfigure: null,
  metadata: null,
  stageConfigure: null,
  simulation: null,
  isSimulatorPanelOpen: false,
};
