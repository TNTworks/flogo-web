import { Action } from '@ngrx/store';
import { TriggerHandler, Trigger } from '@flogo-web/lib-client/core';

export enum TriggerActionType {
  AddTrigger = '[Stream][Trigger] Add trigger',
  RemoveHandler = '[Stream][Trigger] Remove handler',
  UpdateTrigger = '[Stream][Trigger] Update trigger',
  UpdateHandler = '[Stream][Trigger] Update handler',
}

export class RemoveHandler implements Action {
  readonly type = TriggerActionType.RemoveHandler;
  constructor(public payload: string) {}
}

export class AddTrigger implements Action {
  readonly type = TriggerActionType.AddTrigger;
  constructor(public payload: { trigger: Trigger; handler: TriggerHandler }) {}
}

export class UpdateTrigger implements Action {
  readonly type = TriggerActionType.UpdateTrigger;
  constructor(public payload: Trigger) {}
}

export class UpdateHandler implements Action {
  readonly type = TriggerActionType.UpdateHandler;
  constructor(public payload: { triggerId: string; handler: TriggerHandler }) {}
}

export type TriggerActionsUnion =
  | AddTrigger
  | RemoveHandler
  | UpdateTrigger
  | UpdateHandler;
