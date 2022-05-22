import { updateLinks } from '@flogo-web/lib-client/diagram';

import * as selectionFactory from '../models/stream/selection';
import { INITIAL_STREAM_STATE, FlogoStreamState } from './stream.state';
import { StreamActionsUnion, StreamActionType } from './stream.actions';
import { removeStage } from './cases/remove-stage';
import { cleanDanglingTaskOutputMappings } from './clean-dangling-tasks-output-mappings';
import { stageItemCreated } from './cases/stage-item-created';
import { SelectionType } from '../models';
import { commitStageConfiguration } from '../../stage-configurator/models';

export function streamReducer(
  state: FlogoStreamState = INITIAL_STREAM_STATE,
  action: StreamActionsUnion
): FlogoStreamState {
  switch (action.type) {
    case StreamActionType.Init:
      return {
        ...INITIAL_STREAM_STATE,
        ...action.payload,
      };
    case StreamActionType.ChangeName:
    case StreamActionType.RevertName:
      return {
        ...state,
        name: action.payload,
      };
    case StreamActionType.ChangeDescription:
      return {
        ...state,
        description: action.payload,
      };
    case StreamActionType.SelectCreateStage:
      return {
        ...state,
        currentSelection: selectionFactory.makeInsertSelection(action.payload),
      };
    case StreamActionType.StageItemCreated:
      return stageItemCreated(state, action.payload);
    case StreamActionType.CancelCreateStage:
      const selection = state.currentSelection;
      if (
        selection &&
        selection.type === SelectionType.InsertTask &&
        selection.parentId === action.payload
      ) {
        return {
          ...state,
          currentSelection: null,
        };
      }
      return state;
    case StreamActionType.SelectStage:
      const previousSelection = state.currentSelection;
      const isSameSelection =
        previousSelection &&
        previousSelection.type === SelectionType.Task &&
        previousSelection.taskId === action.payload;
      return {
        ...state,
        currentSelection: !isSameSelection
          ? selectionFactory.makeStageSelection(action.payload)
          : null,
      };
    case StreamActionType.DeleteStage:
      return removeStage(state, action.payload);
    case StreamActionType.MoveStage:
      return {
        ...state,
        mainGraph: {
          ...updateLinks(
            state?.mainGraph,
            action.payload.itemId,
            action.payload.parentId
          ),
        },
      };
    case StreamActionType.UpdateMetadata:
      state = cleanDanglingTaskOutputMappings(state, action.payload);
      return {
        ...state,
        metadata: {
          ...action.payload,
        },
      };
    case StreamActionType.ConfigureStage:
      return {
        ...state,
        stageConfigure: action.payload.itemId,
      };
    case StreamActionType.CancelStageConfiguration:
      return {
        ...state,
        stageConfigure: null,
      };
    case StreamActionType.CommitStageConfiguration:
      state = commitStageConfiguration(state, action.payload);
      return {
        ...state,
        stageConfigure: null,
      };
    case StreamActionType.ContributionInstalled:
      return {
        ...state,
        schemas: {
          ...state.schemas,
          [action.payload.ref]: action.payload,
        },
      };
    case StreamActionType.SimulatorPanelStatusChange:
      return {
        ...state,
        isSimulatorPanelOpen: action.payload.isSimulatorOpen,
      };
    case StreamActionType.SimulatorConfigurationChange:
      return {
        ...state,
        simulation: action.payload,
      };
  }
  return state;
}
