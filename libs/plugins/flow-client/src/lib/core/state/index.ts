import { Action, ActionReducer } from '@ngrx/store';
import { INITIAL_STATE, FlowState } from './flow/flow.state';
import { flowReducer } from './flow/flow.reducer';
import { triggersReducer } from './triggers/triggers.reducer';
import { reducer as triggerConfigureReducer } from './triggers-configure/trigger-configure.reducer';

const reducers: ActionReducer<FlowState, Action>[] = [
  flowReducer,
  triggersReducer,
  triggerConfigureReducer,
];
export function featureReducer(state = INITIAL_STATE, action: Action) {
  return reducers.reduce((nextState, reducer) => reducer(nextState, action), state);
}

export * from './flow/flow.actions';
export * from './flow/flow.state';
export * from './flow/flow.reducer';
export * from './flow/flow.selectors';

import * as FlowActions from './flow/flow.actions';
export { FlowActions };

import * as FlowSelectors from './flow/flow.selectors';
export { FlowSelectors };

import * as TriggerActions from './triggers/triggers.actions';
export { TriggerActions };
