import { pick, isEqual } from 'lodash';
import { Observable, from, merge } from 'rxjs';
import { switchMap, take, tap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Effect, ofType, Actions } from '@ngrx/effects';
import { Store, select, Action } from '@ngrx/store';

import { Handler } from '@flogo-web/core';
import { HandlersService, TriggerHandler } from '@flogo-web/lib-client/core';
import {
  StreamActionType,
  FlogoStreamState,
  TriggerActions,
  selectStreamState,
} from '../state';

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
    ofType(StreamActionType.UpdateMetadata),
    switchMap(() => this.latestState$),
    switchMap((state: FlogoStreamState) =>
      merge(
        ...this.getCleanHandlers(state).map(handler =>
          this.saveHandler(state.id, handler).pipe(mapToUpdateAction(handler))
        )
      )
    ),
    tap(acts => console.log(acts))
  );

  private streamState$: Observable<FlogoStreamState>;

  constructor(
    private handlersService: HandlersService,
    private actions$: Actions,
    private store: Store<FlogoStreamState>
  ) {
    this.streamState$ = this.store.pipe(select(selectStreamState));
  }

  private get latestState$() {
    return this.streamState$.pipe(take(1));
  }

  private saveHandler(
    resourceId: string,
    handler: TriggerHandler
  ): Observable<TriggerHandler> {
    return from(
      this.handlersService.updateHandler(handler.triggerId, resourceId, handler)
    );
  }

  private getCleanHandlers({ metadata, handlers }: FlogoStreamState): TriggerHandler[] {
    const inputNames = metadata.input ? metadata.input.map(o => o.name) : null;
    const reduceToUpdatableHandlers = (result, handler) =>
      updateableHandlerReducer(inputNames, result, handler);
    const handlersToUpdate = Object.values(handlers).reduce(
      reduceToUpdatableHandlers,
      []
    );
    return handlersToUpdate;
  }
}

function updateableHandlerReducer(inputNames: string[] | null, result, handler: Handler) {
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
