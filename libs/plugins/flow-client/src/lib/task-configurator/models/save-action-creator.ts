import { cloneDeep } from 'lodash';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { select, Store } from '@ngrx/store';

import { Resource } from '@flogo-web/core';
import { Dictionary } from '@flogo-web/lib-client/core';
import { uniqueTaskName } from '@flogo-web/plugins/flow-core';

import { AppState } from '../../core/state/app.state';
import { FlowState, FlowSelectors, FlowActions } from '../../core/state';
import { HandlerType } from '../../core/models';
import {
  ItemActivityTask,
  ItemBranch,
  ItemSubflow,
  ItemTask,
} from '../../core/interfaces/flow';

export interface SaveTaskConfigEventData {
  tileId: string;
  description?: string;
  name: string;
  iterator: {
    isIterable: boolean;
    iterableValue?: string;
  };
  inputMappings: Dictionary<any>;
  subflowPath?: string;
  changedSubflowSchema?: Resource;
  activitySettings: { [settingName: string]: any };
}
export interface SaveBranchConfigEventData {
  id: string;
  condition: string;
}

export function createSaveAction(
  store: Store<AppState>,
  saveData: SaveTaskConfigEventData
): Observable<FlowActions.CommitItemConfiguration> {
  return store.pipe(
    select(FlowSelectors.selectFlowState),
    take(1),
    map(
      flowState =>
        new FlowActions.CommitItemConfiguration(getChanges(flowState, saveData))
    )
  );
}
export function createSaveBranchAction(
  store: Store<AppState>,
  saveData: SaveBranchConfigEventData
): Observable<FlowActions.ItemUpdated> {
  return store.pipe(
    select(FlowSelectors.selectFlowState),
    take(1),
    map(flowState => new FlowActions.ItemUpdated(getBranchChanges(flowState, saveData)))
  );
}

function getChanges(
  flowState: FlowState,
  saveData: SaveTaskConfigEventData
): FlowActions.CommitItemConfiguration['payload'] {
  let handlerType: HandlerType;
  let tile: ItemTask;
  const tileId = saveData.tileId;
  if (flowState.mainItems[tileId]) {
    handlerType = HandlerType.Main;
    tile = flowState.mainItems[tileId] as ItemTask;
  } else {
    handlerType = HandlerType.Error;
    tile = flowState.errorItems[tileId] as ItemTask;
  }
  const changedSubflowSchema = saveData.changedSubflowSchema;
  const tileAsSubflow = <ItemSubflow>tile;
  const itemChanges: { id: string } & Partial<ItemActivityTask & ItemSubflow> = {
    id: tile.id,
    description: saveData.description,
    name: saveData.name,
    settings: tile.settings,
  };
  if (changedSubflowSchema && tileAsSubflow.settings.flowPath !== saveData.subflowPath) {
    itemChanges.name = uniqueTaskName(
      changedSubflowSchema.name,
      flowState.mainItems,
      flowState.errorItems
    );
    itemChanges.description = changedSubflowSchema.description;
    itemChanges.settings = {
      ...itemChanges.settings,
      flowPath: changedSubflowSchema.id,
    };
  }
  itemChanges.inputMappings = cloneDeep(saveData.inputMappings);
  itemChanges.activitySettings = cloneDeep(saveData.activitySettings);

  const iteratorInfo = saveData.iterator;
  itemChanges.settings = {
    ...itemChanges.settings,
    iterate: iteratorInfo.isIterable ? saveData.iterator.iterableValue : undefined,
  };
  return {
    handlerType,
    item: itemChanges,
    newSubflowSchema: changedSubflowSchema as Resource,
  };
}

function getBranchChanges(
  flowState: FlowState,
  saveData: SaveBranchConfigEventData
): FlowActions.ItemUpdated['payload'] {
  let handlerType: HandlerType;
  const tileId = saveData.id;
  if (flowState.mainItems[tileId]) {
    handlerType = HandlerType.Main;
  } else {
    handlerType = HandlerType.Error;
  }

  const itemChanges: { id: string } & Partial<ItemBranch> = {
    id: saveData.id,
    condition: saveData.condition,
  };
  return { handlerType, item: itemChanges };
}
