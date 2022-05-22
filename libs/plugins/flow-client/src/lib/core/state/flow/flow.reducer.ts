import * as selectionFactory from '../../models/flow/selection';
import { SelectionType } from '../../models';
import { cleanGraphRunState } from '../../models/flow/clean-run-state';

import * as actions from './flow.actions';
import { FlowState, INITIAL_STATE } from './flow.state';

import { createBranch } from './cases/create-branch';
import { taskItemCreated } from './cases/task-item-created';
import { removeItem } from './cases/remove-item';
import { itemUpdate, nodeUpdate } from './cases/item-update';
import { executionUpdate } from './cases/execution-update';
import { commitTaskConfiguration } from './cases/commit-task-configuration';
import { updateMetadata } from './cases/update-metadata';
import { cleanDanglingTaskOutputMappings } from './cases/clean-dangling-tasks-output-mappings';
import { updateLinksOnDrop } from './cases/update-on-drop';
import { runnerReducer } from './runner.reducer';

const ActionType = actions.ActionType;

export function flowReducer(
  state: FlowState = INITIAL_STATE,
  action: actions.ActionsUnion
): FlowState {
  state = runnerReducer(state, action);
  switch (action.type) {
    case ActionType.Init: {
      return {
        ...INITIAL_STATE,
        ...action.payload,
      };
    }
    case ActionType.SelectItem: {
      return {
        ...state,
        currentSelection: selectionFactory.makeTaskSelection(
          action.payload.handlerType,
          action.payload.itemId
        ),
      };
    }
    case ActionType.SelectCreateItem: {
      return {
        ...state,
        currentSelection: selectionFactory.makeInsertSelection(
          action.payload.handlerType,
          action.payload.parentItemId
        ),
      };
    }
    case ActionType.ClearSelection: {
      return {
        ...state,
        currentSelection: null,
      };
    }
    case ActionType.CreateBranch: {
      return createBranch(state, action.payload);
    }
    case ActionType.TaskItemCreated: {
      return taskItemCreated(state, action.payload);
    }
    case ActionType.RemoveItem: {
      return removeItem(state, action.payload);
    }
    case ActionType.MoveItem: {
      return updateLinksOnDrop(state, action.payload);
    }
    case ActionType.ItemUpdated: {
      state = itemUpdate(state, action.payload);
      state = nodeUpdate(state, action.payload);
      return {
        ...state,
        taskConfigure: null,
      };
    }
    case ActionType.UpdateMetadata: {
      state = updateMetadata(state, action.payload);
      state = cleanDanglingTaskOutputMappings(state);
      return state;
    }
    case ActionType.ConfigureItem: {
      return {
        ...state,
        taskConfigure: action.payload.itemId,
      };
    }
    case ActionType.CommitItemConfiguration: {
      state = commitTaskConfiguration(state, action.payload);
      return {
        ...state,
        taskConfigure: null,
      };
    }
    case ActionType.CancelItemConfiguration: {
      return {
        ...state,
        taskConfigure: null,
      };
    }
    case ActionType.RunFromStart:
    case ActionType.RunFromTask: {
      return {
        ...state,
        isErrorPanelOpen: false,
        mainGraph: cleanGraphRunState(state.mainGraph),
        errorGraph: cleanGraphRunState(state.errorGraph),
      };
    }
    case ActionType.ExecutionUpdated: {
      return executionUpdate(state, action.payload);
    }
    case ActionType.ErrorPanelStatusChange: {
      return {
        ...state,
        isErrorPanelOpen: action.payload.isOpen,
        currentSelection: null,
      };
    }
    case ActionType.DebugPanelStatusChange: {
      return {
        ...state,
        isDebugPanelOpen: action.payload.isOpen,
      };
    }
    case ActionType.ContributionInstalled: {
      return {
        ...state,
        schemas: {
          ...state.schemas,
          [action.payload.ref]: action.payload,
        },
      };
    }
    case ActionType.CancelCreateItem: {
      const selection = state.currentSelection;
      if (
        selection &&
        selection.type === SelectionType.InsertTask &&
        selection.parentId === action.payload.parentId
      ) {
        return {
          ...state,
          currentSelection: null,
        };
      }
    }
  }
  return state;
}
