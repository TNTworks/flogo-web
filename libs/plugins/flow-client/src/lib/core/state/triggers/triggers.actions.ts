import { Action } from '@ngrx/store';
import { TriggerSchema } from '@flogo-web/core';
import { Dictionary, TriggerHandler } from '@flogo-web/lib-client/core';
import { Trigger } from '../../interfaces';

export enum TriggerActionType {
  UpdateTrigger = '[Flow][Trigger] Update trigger',
  UpdateHandler = '[Flow][Trigger] Update handler',
  RemoveHandler = '[Flow][Trigger] Remove handler',
  SelectTrigger = '[Flow][Trigger] Select trigger',
  AddTrigger = '[Flow][Trigger] Add trigger',
  CopyTrigger = '[Flow][Trigger] Copy trigger',
}

export class UpdateTrigger implements Action {
  readonly type = TriggerActionType.UpdateTrigger;
  constructor(public payload: Trigger) {}
}

export class UpdateHandler implements Action {
  readonly type = TriggerActionType.UpdateHandler;
  constructor(public payload: { triggerId: string; handler: TriggerHandler }) {}
}

export class RemoveHandler implements Action {
  readonly type = TriggerActionType.RemoveHandler;
  constructor(public payload: string) {}
}

export class SelectTrigger implements Action {
  readonly type = TriggerActionType.SelectTrigger;
  constructor(
    public payload: {
      triggerId: string;
      triggerSchemas: Dictionary<TriggerSchema>;
    }
  ) {}
}

export class AddTrigger implements Action {
  readonly type = TriggerActionType.AddTrigger;
  constructor(public payload: { trigger: Trigger; handler: TriggerHandler }) {}
}

export class CopyTrigger implements Action {
  readonly type = TriggerActionType.CopyTrigger;
  constructor(
    public payload: {
      copiedTriggerId: string;
      newTrigger: Trigger;
      newHandler: TriggerHandler;
    }
  ) {}
}

export type TriggerActionsUnion =
  | UpdateTrigger
  | UpdateHandler
  | RemoveHandler
  | SelectTrigger
  | AddTrigger
  | CopyTrigger;
