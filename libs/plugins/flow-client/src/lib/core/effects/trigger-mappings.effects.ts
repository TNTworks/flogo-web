import { pick, isEqual } from 'lodash';
import { Observable, from, merge } from 'rxjs';
import { switchMap, take, tap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Effect, ofType, Actions } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';

import { Handler } from '@flogo-web/core';
import { HandlersService, TriggerHandler } from '@flogo-web/lib-client/core';
import { FlowActions, FlowState, FlowSelectors, TriggerActions } from '../state';
const ActionType = FlowActions.ActionType;

const mapToUpdateAction = (handler: TriggerHandler) =>
  map(
    () =>
      new TriggerActions.UpdateHandler({
        triggerId: handler.triggerId,
        handler,
      })
  );

@Injectable()
export class TriggerMappingsEffects {
  @Effect()
  cleanDanglingMappings$: Observable<Action> = this.actions$.pipe(
    ofType(ActionType.UpdateMetadata),
    switchMap(() => this.latestState$),
    switchMap((state: FlowState) =>
      merge(
        ...this.getCleanHandlers(state).map(handler =>
          this.saveHandler(state.id, handler).pipe(mapToUpdateAction(handler))
        )
      )
    ),
    tap(acts => console.log(acts))
  );

  private flowState$: Observable<FlowState>;

  constructor(
    private handlersService: HandlersService,
    private actions$: Actions,
    private store: Store<FlowState>
  ) {
    this.flowState$ = this.store.pipe(select(FlowSelectors.selectFlowState));
  }

  private get latestState$() {
    return this.flowState$.pipe(take(1));
  }

  private saveHandler(
    resourceId: string,
    handler: TriggerHandler
  ): Observable<TriggerHandler> {
    return from(
      this.handlersService.updateHandler(handler.triggerId, resourceId, handler)
    );
  }

  private getCleanHandlers({ metadata, handlers }: FlowState): TriggerHandler[] {
    const inputNames = metadata.input.map(o => o.name);
    const reduceToUpdatableHandlers = (result, handler) =>
      updateableHandlerReducer(inputNames, result, handler);
    const handlersToUpdate = Object.values(handlers).reduce(
      reduceToUpdatableHandlers,
      []
    );
    return handlersToUpdate;
  }
}

function updateableHandlerReducer(inputNames: string[], result, handler: Handler) {
  const currentMappings =
    (handler.actionMappings || <Handler['actionMappings']>{}).input || {};
  const applicableMappings = pick(currentMappings, inputNames);
  if (!isEqual(applicableMappings, currentMappings)) {
    result.push({
      ...handler,
      actionMappings: { ...handler.actionMappings, input: applicableMappings },
    });
  }
  return result;
}
