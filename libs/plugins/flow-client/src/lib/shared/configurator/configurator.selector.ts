import { select, Store } from '@ngrx/store';
import { Observable, of as observableOf } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';

import { FLOGO_TASK_TYPE } from '../../core';
import { FlowSelectors, FlowState } from '../../core/state';
import { AppState } from '../../core/state/app.state';

const getFlowState = (
  store: Store<AppState>,
  taskId: string,
  taskType: FLOGO_TASK_TYPE[]
): Observable<FlowState> => {
  return store.pipe(
    select(FlowSelectors.selectFlowState),
    take(1),
    filter(state => {
      const task = state.mainItems[taskId] || state.errorItems[taskId];
      return taskType.includes(task.type);
    })
  );
};

export function getStateWhenConfigureChanges(taskType: FLOGO_TASK_TYPE[]) {
  return (store: Store<AppState>) =>
    store.pipe(
      select(FlowSelectors.selectTaskConfigure),
      switchMap(taskId =>
        taskId ? getFlowState(store, taskId, taskType) : observableOf(null)
      )
    ) as Observable<FlowState | null>;
}
