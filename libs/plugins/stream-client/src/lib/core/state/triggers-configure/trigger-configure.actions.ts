import { Action } from '@ngrx/store';
import { TriggerSchema } from '@flogo-web/core';
import { Dictionary } from '@flogo-web/lib-client/core';
import { TriggerConfigureTabType } from '../../interfaces';

export enum TriggerConfigureActionType {
  OpenConfigureWithSelection = '[Stream] [Trigger] [Configure] Open Configure with trigger selected',
  CloseConfigure = '[Stream] [Trigger] [Configure] Close Configure',
  SelectTrigger = '[Stream] [Trigger] [Configure] Select Trigger',
  SelectTab = '[Stream] [Trigger] [Configure] Select Trigger Tab',
  CofigureStatusChanged = '[Stream] [Trigger] [Configure] Trigger Configuration update',
  SaveTriggerStarted = '[Stream] [Trigger] [Configure] Saving trigger',
  SaveTriggerCompleted = '[Stream] [Trigger] [Configure] Save trigger completed',
}

export class OpenConfigureWithSelection implements Action {
  readonly type = TriggerConfigureActionType.OpenConfigureWithSelection;
  constructor(
    public payload: {
      triggerId: string;
      triggerSchemas: Dictionary<TriggerSchema>;
    }
  ) {}
}

export class CloseConfigure implements Action {
  readonly type = TriggerConfigureActionType.CloseConfigure;
}

export class SelectTrigger implements Action {
  readonly type = TriggerConfigureActionType.SelectTrigger;
  constructor(public payload: string) {}
}

export class SelectTab implements Action {
  readonly type = TriggerConfigureActionType.SelectTab;
  constructor(public payload: TriggerConfigureTabType) {}
}

export class ConfigureStatusChanged implements Action {
  readonly type = TriggerConfigureActionType.CofigureStatusChanged;
  constructor(
    public payload: {
      triggerId: string;
      groupType: TriggerConfigureTabType;
      newStatus: {
        isValid: boolean;
        isDirty: boolean;
        isEnabled?: boolean;
        isPending?: boolean;
      };
    }
  ) {}
}

export class SaveTriggerStarted implements Action {
  readonly type = TriggerConfigureActionType.SaveTriggerStarted;
  constructor(public payload: { triggerId: string }) {}
}

export class SaveTriggerCompleted implements Action {
  readonly type = TriggerConfigureActionType.SaveTriggerCompleted;
  constructor(public payload: { triggerId: string }) {}
}

export type TriggerConfigureActionUnion =
  | OpenConfigureWithSelection
  | CloseConfigure
  | SelectTrigger
  | SelectTab
  | ConfigureStatusChanged
  | SaveTriggerStarted
  | SaveTriggerCompleted;
