import { forIn, cloneDeep } from 'lodash';
import { ReplaySubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import {
  MapperState,
  MapperTreeNode,
  Mappings,
  ParsedExpressionDetails,
  TreeState,
} from '../../models';
import { TreeNodeFactoryService } from '../tree-node-factory.service';
import { TreeService } from '../tree.service';
import { aggregateStatusChanges } from './aggregate-status-changes';
import { updateNodeExpression } from './update-node-expression';
import { selectMapperStatus } from './select-mapper-status.operator';
import { isSameEditingExpression } from './is-same-editing-expression';

export class MapperController {
  state$: Observable<MapperState>;
  status$: Observable<{ isDirty: boolean; isValid: boolean }>;
  private stateSrc: ReplaySubject<MapperState>;
  private readonly initialFunctions: MapperTreeNode[];
  private pristineOutputs: MapperTreeNode[];

  constructor(
    initialState: MapperState,
    private nodeFactory: TreeNodeFactoryService,
    private treeService: TreeService
  ) {
    this.initialFunctions = cloneDeep(initialState.functions.nodes);
    this.pristineOutputs = cloneDeep(initialState.outputs.nodes);
    this.stateSrc = new ReplaySubject<MapperState>(1);
    this.stateSrc.next(initialState);
    this.state$ = this.stateSrc.asObservable();
    this.status$ = this.state$.pipe(selectMapperStatus);
  }

  selectInput(node: MapperTreeNode) {
    const state = this.applyInputSelection(node);
    this.updateState(state);
  }

  filterInputs(filterTerm: string) {
    const state = this.getCurrentState();
    this.updateState({
      ...state,
      inputs: {
        ...state.inputs,
        filterTerm,
      },
    });
  }

  filterOutputs(filterTerm: string) {
    this.updateState({
      ...this.getCurrentState(),
      outputs: this.applyTreeFilter(filterTerm, this.getCurrentState().outputs),
    });
  }

  filterFunctions(filterTerm: string) {
    const state = this.getCurrentState();
    this.updateState({
      ...state,
      functions: this.applyTreeFilter(filterTerm, state.functions),
    });
  }

  expressionChange(nodePath: string, expression: string) {
    const state = this.applyExpressionChange(this.getCurrentState(), {
      nodePath,
      expression,
    });
    this.updateState(state);
  }

  appendOutputNode(outputNode: MapperTreeNode) {
    const newOutputs = cloneDeep(this.pristineOutputs);
    newOutputs.push(outputNode);
    this.pristineOutputs = cloneDeep(newOutputs);
    const currentState = this.getCurrentState();
    this.updateState({
      ...currentState,
      outputs: {
        ...currentState.outputs,
        nodes: newOutputs,
      },
    });
  }

  removeOutputNode(path: string) {
    this.pristineOutputs = this.pristineOutputs.filter(node => node.path !== path);
    const currentState = this.getCurrentState();
    this.updateState({
      ...currentState,
      outputs: {
        ...currentState.outputs,
        nodes: cloneDeep(this.pristineOutputs),
      },
    });
  }

  resetStatus() {
    const resetState: MapperState = {
      ...this.getCurrentState(),
      isDirty: false,
    };
    forIn(resetState.inputs.nodes, node => {
      node.isDirty = false;
    });
    this.updateState(resetState);
  }

  getCurrentState() {
    let currentState;
    this.stateSrc.pipe(take(1)).subscribe(state => (currentState = state));
    return currentState;
  }

  getMappings() {
    const state = this.getCurrentState();
    return state.mappings;
  }

  private updateState(state: MapperState) {
    this.stateSrc.next(state);
  }

  private applyInputSelection(node: MapperTreeNode): MapperState {
    const state = this.getCurrentState();
    return {
      ...state,
      mappingKey: node.path,
      functions: { filterTerm: '', nodes: cloneDeep(this.initialFunctions) },
      outputs: { filterTerm: '', nodes: cloneDeep(this.pristineOutputs) },
    };
  }

  private applyExpressionChange(
    state: MapperState,
    { nodePath, expression }: { nodePath: string; expression: string }
  ): MapperState {
    if (isSameEditingExpression(state.mappings[nodePath], { expression })) {
      return state;
    }
    const mappings = this.updateMapping(state.mappings, nodePath, expression);
    const prevNode = state.inputs.nodes[nodePath];
    const newNode = updateNodeExpression(prevNode, expression);
    const nodes = {
      ...state.inputs.nodes,
      [nodePath]: newNode,
    };
    state = {
      ...state,
      mappings,
      inputs: {
        ...state.inputs,
        nodes,
      },
    };
    state = aggregateStatusChanges(state, prevNode, newNode);
    return state;
  }

  private updateMapping(
    mappings: Mappings,
    path: string,
    expression: string,
    parsedExpressionDetails?: ParsedExpressionDetails
  ): Mappings {
    const existingMapping = mappings[path];
    const isEmptyExpression = !expression || !expression.trim();
    if (isEmptyExpression && !existingMapping) {
      return mappings;
    }
    if (existingMapping && isEmptyExpression) {
      const { [path]: mappingToRemove, ...newMappings } = mappings;
      return newMappings;
    }
    const subMappings = existingMapping ? existingMapping.mappings : {};
    return {
      ...mappings,
      [path]: {
        expression,
        mappings: subMappings,
        parsedExpressionDetails,
      },
    };
  }

  private applyTreeFilter(
    filterTerm: string,
    treeState: TreeState,
    currentSelection?: MapperTreeNode
  ) {
    const currentSelectionPath =
      currentSelection && currentSelection.data ? currentSelection.data.path : null;
    const nodes = this.treeService.applyFilter(
      treeState.nodes,
      filterTerm,
      currentSelectionPath
    );
    return Object.assign({}, treeState, { filterTerm, nodes });
  }
}
