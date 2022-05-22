import { createSelector, createFeatureSelector, MemoizedSelector } from '@ngrx/store';
import {
  ContributionType,
  ContributionSchema as ContribSchema,
  FunctionsSchema,
  CONTRIB_REFS,
  ActivitySchema,
} from '@flogo-web/core';
import {
  Dictionary,
  FlowGraph,
  GraphNodeDictionary,
  InstalledFunctionSchema,
} from '@flogo-web/lib-client/core';
import { DiagramSelectionType } from '@flogo-web/lib-client/diagram';

import { getGraphName, getItemsDictionaryName, nodesContainErrors } from '../utils';

import {
  InsertTaskSelection,
  HandlerType,
  TaskSelection,
  SelectionType,
} from '../../models';
import { Activity } from '../../../task-add';
import { Item, ItemActivityTask } from '../../interfaces';
import { FLOGO_TASK_TYPE } from '../../constants';

import { FlowState } from './flow.state';
import { determineRunnableStatus } from './views/determine-runnable-status';
import { isInsertBetween } from '../../models/flow/is-insert-between';

export const selectFlowState = createFeatureSelector<FlowState>('flow');
export const selectCurrentSelection = createSelector(
  selectFlowState,
  (flowState: FlowState) => flowState.currentSelection
);
export const selectFlowMetadata = createSelector(
  selectFlowState,
  (flowState: FlowState) => flowState.metadata
);
export const selectErrorPanelStatus = createSelector(
  selectFlowState,
  (flowState: FlowState) => flowState.isErrorPanelOpen
);
export const selectDebugPanelOpen = createSelector(
  selectFlowState,
  (flowState: FlowState) => flowState.isDebugPanelOpen
);
export const selectTriggers = createSelector(
  selectFlowState,
  (flowState: FlowState) => flowState.triggers
);
export const selectHandlers = createSelector(
  selectFlowState,
  (flowState: FlowState) => flowState.handlers
);
export const selectApp = createSelector(selectFlowState, flowState => flowState.app);
export const selectActionId = createSelector(selectFlowState, flowState => flowState.id);
export const selectTriggerConfigure = createSelector(
  selectFlowState,
  (flowState: FlowState) => flowState.triggerConfigure
);
export const selectTaskConfigure = createSelector(
  selectFlowState,
  (flowState: FlowState) => flowState.taskConfigure
);
export const selectSchemas = createSelector(
  selectFlowState,
  (flowState: FlowState) => flowState.schemas
);
export const selectLastExecutionResult = createSelector(
  selectFlowState,
  (flowState: FlowState) => flowState.lastExecutionResult
);
export const selectLastFullExecution = createSelector(
  selectFlowState,
  (flowState: FlowState) => flowState.lastFullExecution
);
export const selectHasStructureChangedSinceLastRun = createSelector(
  selectFlowState,
  (flowState: FlowState) => flowState.structureChangedSinceLastFullExecution
);

export const getItems = (handlerType: HandlerType) => {
  const handlerName = getItemsDictionaryName(handlerType);
  return createSelector(
    selectFlowState,
    flowState => flowState[handlerName] as Dictionary<Item>
  );
};

export const getAllItems = createSelector(
  getItems(HandlerType.Main),
  getItems(HandlerType.Error),
  (mainItems, errorItems) => ({ mainItems, errorItems })
);

export const getRunnableState = createSelector(getAllItems, ({ mainItems, errorItems }) =>
  determineRunnableStatus(mainItems, errorItems)
);

export const getCurrentHandlerId = createSelector(
  selectErrorPanelStatus,
  isErrorPanelOpen => {
    return isErrorPanelOpen ? HandlerType.Error : HandlerType.Main;
  }
);

export const getCurrentGraph = createSelector(
  selectFlowState,
  getCurrentHandlerId,
  (flowState, currentHandlerId) => {
    return flowState[getGraphName(currentHandlerId)] as FlowGraph;
  }
);

export const getSelectionForCurrentHandler = createSelector(
  selectCurrentSelection,
  (currentSelection: TaskSelection | InsertTaskSelection) => {
    if (currentSelection && currentSelection.type === SelectionType.Task) {
      return {
        type: DiagramSelectionType.Node,
        taskId: currentSelection.taskId,
        diagramId: currentSelection.handlerType,
      };
    } else if (currentSelection && currentSelection.type === SelectionType.InsertTask) {
      return {
        type: DiagramSelectionType.Insert,
        taskId: currentSelection.parentId,
        diagramId: currentSelection.handlerType,
      };
    } else {
      return null;
    }
  }
);

export const getCurrentHandlerType = createSelector(
  selectCurrentSelection,
  selectFlowState,
  currentSelection => {
    if (!currentSelection) {
      return null;
    }
    if (currentSelection.type === SelectionType.Task) {
      return currentSelection.handlerType;
    }
    return null;
  }
);

export const getTaskInsertType = createSelector(
  selectCurrentSelection,
  selectFlowState,
  (currentSelection: InsertTaskSelection, flowState: FlowState) => {
    if (currentSelection && currentSelection.type === SelectionType.InsertTask) {
      return isInsertBetween(currentSelection.parentId, flowState.mainGraph);
    } else {
      return null;
    }
  }
);

export const getCurrentItems: MemoizedSelector<
  FlowState,
  Dictionary<Item>
> = createSelector(
  getCurrentHandlerType,
  selectFlowState,
  (currentHandlerType, flowState) =>
    currentHandlerType ? flowState[getItemsDictionaryName(currentHandlerType)] : null
);

export const getCurrentNodes: MemoizedSelector<
  FlowState,
  GraphNodeDictionary
> = createSelector(
  getCurrentHandlerType,
  selectFlowState,
  (currentHandlerType, flowState) =>
    currentHandlerType
      ? (flowState[getGraphName(currentHandlerType)].nodes as GraphNodeDictionary)
      : null
);

export const getCurrentItemsTriggersAndSchemas: MemoizedSelector<
  FlowState,
  [Dictionary<Item>, Dictionary<ContribSchema>]
> = createSelector(
  selectFlowState,
  getCurrentHandlerId,
  selectTriggers,
  selectSchemas,
  (flowState, handlerId, triggers, schemas) => {
    const items = flowState[getItemsDictionaryName(handlerId)];
    return [{ ...items, ...triggers }, schemas];
  }
);

const isTaskSelection = (selection): selection is TaskSelection =>
  selection && selection.type === SelectionType.Task;
export const getSelectedActivity = createSelector(
  selectCurrentSelection,
  getCurrentItems,
  (currentSelection, currentItems) => {
    if (
      isTaskSelection(currentSelection) &&
      currentItems[currentSelection.taskId] &&
      currentItems[currentSelection.taskId].type !== FLOGO_TASK_TYPE.TASK_BRANCH
    ) {
      return currentItems[currentSelection.taskId] as ItemActivityTask;
    }
    return null;
  }
);

export const getSelectedActivitySchema = createSelector(
  getSelectedActivity,
  selectSchemas,
  (selectedActivity, schemas) => (selectedActivity ? schemas[selectedActivity.ref] : null)
);

export const getSelectedActivityExecutionResult = createSelector(
  getSelectedActivity,
  selectLastExecutionResult,
  /* tslint:disable-next-line:triple-equals --> for legacy ids of type number so 1 == '1' */
  (selectedActivity, steps) =>
    selectedActivity && steps ? steps[selectedActivity.id] : null
);

export const getFlowHasRun = createSelector(
  selectLastFullExecution,
  lastFullExecution => lastFullExecution && lastFullExecution.processId
);

export const getIsRunDisabledForSelectedActivity = createSelector(
  getCurrentHandlerType,
  getRunnableState,
  getFlowHasRun,
  selectHasStructureChangedSinceLastRun,
  (handlerType, runnableInfo, flowHasRun, structureHasChanged) => {
    const isErrorHandler = handlerType === HandlerType.Error;
    const isRunDisabled = runnableInfo && runnableInfo.disabled;
    return isErrorHandler || structureHasChanged || isRunDisabled || !flowHasRun;
  }
);

export const getIsRestartableTask = createSelector(
  getCurrentHandlerType,
  handlerType => handlerType !== HandlerType.Error
);

export const getCurrentActivityExecutionErrors = createSelector(
  getSelectedActivity,
  getCurrentNodes,
  (activity, nodes) => {
    return activity && nodes ? nodes[activity.id].status.executionErrored : null;
  }
);

export const getGraph = (handlerType: HandlerType) => {
  const graphName = getGraphName(handlerType);
  return createSelector(selectFlowState, flowState => flowState[graphName] as FlowGraph);
};

const getMainGraphNodes = createSelector(
  getGraph(HandlerType.Main),
  mainGraph => mainGraph.nodes
);
const getErrorGraphNodes = createSelector(
  getGraph(HandlerType.Error),
  errorGraph => errorGraph.nodes
);
export const getPrimaryFlowHasExecutionErrors = createSelector(getMainGraphNodes, nodes =>
  nodesContainErrors(nodes)
);
export const getErrorFlowHasExecutionErrors = createSelector(getErrorGraphNodes, nodes =>
  nodesContainErrors(nodes)
);

export const selectAppInfo = createSelector(selectApp, app => {
  if (!app) {
    return {
      appId: null,
    };
  }
  return {
    appId: app.id,
  };
});

export const selectAppAndFlowInfo = createSelector(
  selectAppInfo,
  selectActionId,
  (appInfo, actionId) => ({ ...appInfo, actionId })
);

export const getInstalledActivities = createSelector(
  selectSchemas,
  (schemas: Dictionary<ContribSchema>): Activity[] => {
    const activities = Object.values(schemas)
      .filter(schema => schema.type === ContributionType.Activity)
      .map((schema: ActivitySchema) => ({
        title: schema.title,
        ref: schema.ref,
        isReturnType: !!schema.return,
        icon: schema.icon,
      }))
      .sort((activity1, activity2) => {
        if (activity1.ref === CONTRIB_REFS.SUBFLOW) {
          return -1;
        } else if (activity2.ref === CONTRIB_REFS.SUBFLOW) {
          return 1;
        }
        return ('' + activity1.title).localeCompare(activity2.title);
      });
    return activities;
  }
);
export const getInstalledFunctions = createSelector(
  selectSchemas,
  (schemas: Dictionary<FunctionsSchema>): InstalledFunctionSchema[] => {
    return Object.values(schemas)
      .filter(schema => schema.type === ContributionType.Function)
      .map(schema => ({
        functions: schema.functions,
        name: schema.name,
        type: schema.type,
        ref: schema.ref,
      }));
  }
);
