import { Observable } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { Action } from '@ngrx/store';
import { Actions, Effect, ofType } from '@ngrx/effects';

import { FlowActions } from '../state';
import { FlogoFlowService as FlowsService } from '../flow.service';
const ActionType = FlowActions.ActionType;

@Injectable()
export class SaveEffects {
  @Effect()
  saveFlow$: Observable<Action> = this.actions$.pipe(
    ofType(
      ActionType.TaskItemCreated,
      ActionType.RemoveItem,
      ActionType.ItemUpdated,
      ActionType.CommitItemConfiguration,
      ActionType.MoveItem,
      ActionType.UpdateMetadata
    ),
    switchMap(() => this.saveFlow()),
    filter(flowWasSaved => flowWasSaved),
    map(() => new FlowActions.FlowSaveSuccess())
  );

  constructor(private flowService: FlowsService, private actions$: Actions) {}

  private saveFlow() {
    return this.flowService.currentFlowDetails.flowState$.pipe(
      take(1),
      switchMap(flowState => this.flowService.saveFlowIfChanged(flowState.id, flowState))
    );
  }
}
