import { Action } from '@ngrx/store';
import { Resource, ContributionSchema } from '@flogo-web/core';
import { Dictionary, GraphNode, StepAttribute } from '@flogo-web/lib-client/core';
import { FlowMetadata, Item, ItemTask } from '../../interfaces/flow';
import { HandlerType } from '../../models';
import { FlowState } from './flow.state';

export enum ActionType {
  Init = '[Flow] Init',
  SelectCreateItem = '[Flow] Select create task',
  CancelCreateItem = '[Flow] Cancel create task',
  TaskItemCreated = '[Flow] Task created',
  ConfigureItem = '[Flow] Configure item',
  SelectItem = '[Flow] Select item',
  RemoveItem = '[Flow] Remove item',
  MoveItem = '[Flow] Change item position',
  CreateBranch = '[Flow] Create branch',
  ItemUpdated = '[Flow] Item updated',
  CommitItemConfiguration = '[Flow] Commit item configuration',
  CancelItemConfiguration = '[Flow] Cancel item configuration',
  UpdateMetadata = '[Flow] Update Metadata',
  ClearSelection = '[Flow] Clear selection',
  RunFromStart = '[Run Flow] Run from start',
  RunFromTask = '[Run Flow] Run from tile',
  NewExecutionRegistered = '[Run Flow] New execution registered',
  NewProcessRanFromStart = '[Run Flow] New process started from beginning',
  ExecutionUpdated = '[Run Flow] Execution updated',
  ExecutionStepsUpdate = '[Run Flow] Steps update',
  ErrorPanelStatusChange = '[Flow] Error panel status change',
  DebugPanelStatusChange = '[Flow][Debug panel] Debug panel status change',
  FlowSaveSuccess = '[Flow] Save success',
  ContributionInstalled = '[Flow] Contribution installed',
}

interface BaseFlowAction extends Action {
  readonly type: ActionType;
}

export class Init implements BaseFlowAction {
  readonly type = ActionType.Init;
  constructor(public payload: FlowState) {}
}

export class SelectItem implements BaseFlowAction {
  readonly type = ActionType.SelectItem;
  constructor(public payload: { handlerType: HandlerType; itemId: string } | null) {}
}

export class SelectCreateItem implements BaseFlowAction {
  readonly type = ActionType.SelectCreateItem;
  constructor(
    public payload: {
      handlerType: HandlerType;
      parentItemId: string;
    }
  ) {}
}

export class ClearSelection implements BaseFlowAction {
  readonly type = ActionType.ClearSelection;
  constructor() {}
}

export class CreateBranch implements BaseFlowAction {
  readonly type = ActionType.CreateBranch;
  constructor(
    public payload: {
      handlerType: HandlerType;
      parentId: string;
      newBranchId: string;
    }
  ) {}
}

export class TaskItemCreated implements BaseFlowAction {
  readonly type = ActionType.TaskItemCreated;
  constructor(
    public payload: {
      handlerType: HandlerType;
      item: ItemTask;
      node: GraphNode;
      subflowSchema?: Resource;
    }
  ) {}
}

export class RemoveItem implements BaseFlowAction {
  readonly type = ActionType.RemoveItem;
  constructor(public payload: { handlerType: HandlerType; itemId: string }) {}
}

export class MoveItem implements BaseFlowAction {
  readonly type = ActionType.MoveItem;
  constructor(
    public payload: { handlerType: HandlerType; itemId: string; parentId: string }
  ) {}
}

export class ItemUpdated implements BaseFlowAction {
  readonly type = ActionType.ItemUpdated;
  constructor(
    public payload: {
      handlerType: HandlerType;
      item: { id: string } & Partial<Item>;
      node?: { id: string } & Partial<GraphNode>;
    }
  ) {}
}

export class ConfigureItem implements BaseFlowAction {
  readonly type = ActionType.ConfigureItem;
  constructor(public payload: { itemId: string }) {}
}

export class CommitItemConfiguration implements BaseFlowAction {
  readonly type = ActionType.CommitItemConfiguration;
  constructor(
    public payload: {
      handlerType: HandlerType;
      item: { id: string } & Partial<Item>;
      newSubflowSchema?: Resource;
    }
  ) {}
}

export class CancelItemConfiguration implements BaseFlowAction {
  readonly type = ActionType.CancelItemConfiguration;
}

export class UpdateMetadata implements BaseFlowAction {
  readonly type = ActionType.UpdateMetadata;
  constructor(public payload: FlowMetadata) {}
}

export class RunFromStart implements BaseFlowAction {
  readonly type = ActionType.RunFromStart;
}

export class RunFromTask implements BaseFlowAction {
  readonly type = ActionType.RunFromTask;
}

export class NewExecutionRegistered implements BaseFlowAction {
  readonly type = ActionType.NewExecutionRegistered;
}

export class NewRunFromStartProcess implements BaseFlowAction {
  readonly type = ActionType.NewProcessRanFromStart;
  constructor(public payload: { processId: string; instanceId: string }) {}
}

export class ExecutionStateUpdated implements BaseFlowAction {
  readonly type = ActionType.ExecutionUpdated;
  constructor(
    public payload: {
      changes: {
        mainGraphNodes?: Dictionary<GraphNode>;
        errorGraphNodes?: Dictionary<GraphNode>;
      };
    }
  ) {}
}

export class ExecutionStepsUpdated implements BaseFlowAction {
  readonly type = ActionType.ExecutionStepsUpdate;
  constructor(public payload: { steps: Dictionary<Dictionary<StepAttribute>> }) {}
}

export class ErrorPanelStatusChange implements BaseFlowAction {
  readonly type = ActionType.ErrorPanelStatusChange;
  constructor(public payload: { isOpen: boolean }) {}
}

export class DebugPanelStatusChange implements BaseFlowAction {
  readonly type = ActionType.DebugPanelStatusChange;
  constructor(public payload: { isOpen: boolean }) {}
}

export class FlowSaveSuccess implements BaseFlowAction {
  readonly type = ActionType.FlowSaveSuccess;
}

export class ContributionInstalled implements BaseFlowAction {
  readonly type = ActionType.ContributionInstalled;
  constructor(public payload: ContributionSchema) {}
}

export class CancelCreateItem implements BaseFlowAction {
  readonly type = ActionType.CancelCreateItem;
  constructor(public payload: { parentId: string }) {}
}

export type ActionsUnion =
  | Init
  | SelectCreateItem
  | TaskItemCreated
  | ConfigureItem
  | ClearSelection
  | SelectItem
  | RemoveItem
  | MoveItem
  | CreateBranch
  | ItemUpdated
  | UpdateMetadata
  | CommitItemConfiguration
  | CancelItemConfiguration
  | NewExecutionRegistered
  | NewRunFromStartProcess
  | RunFromStart
  | RunFromTask
  | ExecutionStepsUpdated
  | ExecutionStateUpdated
  | ErrorPanelStatusChange
  | DebugPanelStatusChange
  | ContributionInstalled
  | CancelCreateItem;
