import { Action } from '@ngrx/store';

import { ContributionSchema, StreamSimulation } from '@flogo-web/core';
import { StreamMetadata } from '@flogo-web/plugins/stream-core';
import { GraphNode } from '@flogo-web/lib-client/core';

import { FlogoStreamState } from './stream.state';
import { Item } from '../interfaces';

export enum StreamActionType {
  Init = '[Stream] Init',
  ChangeName = '[Stream] Name changed',
  RevertName = '[Stream] Revert name',
  ChangeDescription = '[Stream] Description changed',
  StreamSaveSuccess = '[Stream] Save success',
  UpdateMetadata = '[Stream] Update Metadata',
  SelectCreateStage = '[Stream] Add a stage',
  StageItemCreated = '[Stream] Stage created',
  CancelCreateStage = '[Stream] Cancel create stage',
  SelectStage = '[Stream] Select item',
  SelectRemoveStage = '[Stream] Ask to delete stage',
  DeleteStage = '[Stream] Confirm delete stage',
  MoveStage = '[Stream] Change stage position',
  ConfigureStage = '[Stream] Configure stage',
  CancelStageConfiguration = '[Stream] Cancel stage configuration',
  CommitStageConfiguration = '[Stream] Commit stage configuration',
  ContributionInstalled = '[Stream] Contribution installed',
  SimulatorPanelStatusChange = '[Stream][Simulator panel] Simulator panel status change',
  SimulatorConfigurationChange = '[Stream][Simulator] Simulator configuration change',
}

interface BaseStreamAction extends Action {
  readonly type: StreamActionType;
}

export class Init implements BaseStreamAction {
  readonly type = StreamActionType.Init;
  constructor(public payload: FlogoStreamState) {}
}

export class ChangeName implements BaseStreamAction {
  readonly type = StreamActionType.ChangeName;
  constructor(public payload: string) {}
}

export class RevertName implements BaseStreamAction {
  readonly type = StreamActionType.RevertName;
  constructor(public payload: string) {}
}

export class ChangeDescription implements BaseStreamAction {
  readonly type = StreamActionType.ChangeDescription;
  constructor(public payload: string) {}
}

export class StreamSaveSuccess implements BaseStreamAction {
  readonly type = StreamActionType.StreamSaveSuccess;
}

export class SelectCreateStage implements BaseStreamAction {
  readonly type = StreamActionType.SelectCreateStage;
  constructor(public payload: string) {}
}

export class StageItemCreated implements BaseStreamAction {
  readonly type = StreamActionType.StageItemCreated;
  constructor(
    public payload: {
      item: Item;
      node: Partial<GraphNode>;
    }
  ) {}
}

export class CancelCreateStage implements BaseStreamAction {
  readonly type = StreamActionType.CancelCreateStage;
  constructor(public payload: string) {}
}

export class SelectStage implements BaseStreamAction {
  readonly type = StreamActionType.SelectStage;
  constructor(public payload: string | null) {}
}

export class SelectRemoveStage implements BaseStreamAction {
  readonly type = StreamActionType.SelectRemoveStage;
  constructor(public payload: string) {}
}

export class ConfirmDeleteStage implements BaseStreamAction {
  readonly type = StreamActionType.DeleteStage;
  constructor(public payload: string) {}
}

export class MoveStage implements BaseStreamAction {
  readonly type = StreamActionType.MoveStage;
  constructor(public payload: { itemId: string; parentId: string }) {}
}

export class UpdateMetadata implements BaseStreamAction {
  readonly type = StreamActionType.UpdateMetadata;
  constructor(public payload: StreamMetadata) {}
}

export class ConfigureStage implements BaseStreamAction {
  readonly type = StreamActionType.ConfigureStage;
  constructor(public payload: { itemId: string }) {}
}

export class CancelStageConfiguration implements BaseStreamAction {
  readonly type = StreamActionType.CancelStageConfiguration;
}

export class CommitStageConfiguration implements BaseStreamAction {
  readonly type = StreamActionType.CommitStageConfiguration;
  constructor(public payload: Partial<Item>) {}
}

export class ContributionInstalled implements BaseStreamAction {
  readonly type = StreamActionType.ContributionInstalled;
  constructor(public payload: ContributionSchema) {}
}

export class SimulatorPanelStatusChange implements BaseStreamAction {
  readonly type = StreamActionType.SimulatorPanelStatusChange;
  constructor(public payload: { isSimulatorOpen: boolean }) {}
}

export class SimulatorConfigurationChange implements BaseStreamAction {
  readonly type = StreamActionType.SimulatorConfigurationChange;
  constructor(public payload: StreamSimulation.SimulationConfig) {}
}

export type StreamActionsUnion =
  | Init
  | ChangeName
  | RevertName
  | ChangeDescription
  | StreamSaveSuccess
  | SelectCreateStage
  | SelectStage
  | SelectRemoveStage
  | ConfirmDeleteStage
  | MoveStage
  | CancelCreateStage
  | StageItemCreated
  | UpdateMetadata
  | ConfigureStage
  | CancelStageConfiguration
  | CommitStageConfiguration
  | ContributionInstalled
  | SimulatorPanelStatusChange
  | SimulatorConfigurationChange;
