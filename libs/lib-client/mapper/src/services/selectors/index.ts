import { isEqual } from 'lodash';
import { Observable, OperatorFunction, combineLatest, pipe } from 'rxjs';
import {
  distinctUntilChanged,
  distinctUntilKeyChanged,
  map,
  shareReplay,
} from 'rxjs/operators';

import { MapExpression, MapperState, TreeState } from '../../models';

function selectFromMapperState<T extends keyof MapperState>(
  property: T
): OperatorFunction<MapperState, MapperState[T]> {
  return pipe(
    distinctUntilKeyChanged<MapperState>(property),
    map((state: MapperState) => state[property])
  );
}

export const selectedInputKey = selectFromMapperState('mappingKey');
export const selectInputsState = selectFromMapperState('inputs');
export const selectMappings = selectFromMapperState('mappings');

export const selectFunctionsState = selectFromMapperState('functions');
export const selectOutputsState = selectFromMapperState('outputs');

function selectFromTreeState<P extends keyof TreeState>(propName: P) {
  return function(source: Observable<TreeState>) {
    return source.pipe(
      map(treeState => treeState[propName]),
      distinctUntilChanged()
    );
  };
}

export const selectNodesFromOutputs = pipe(
  selectOutputsState,
  selectFromTreeState('nodes')
);

export const selectFilterFromOutputs = pipe(
  selectOutputsState,
  selectFromTreeState('filterTerm')
);

export const selectNodesFromFunctions = pipe(
  selectFunctionsState,
  selectFromTreeState('nodes')
);

export const selectFilterFromFunctions = pipe(
  selectFunctionsState,
  selectFromTreeState('filterTerm')
);

export const selectInputFilter: OperatorFunction<MapperState, string | null> = pipe(
  selectInputsState,
  map(inputsState => inputsState.filterTerm)
);

export const selectInputNodes = pipe(
  selectInputsState,
  map((inputsState: MapperState['inputs']) => inputsState.nodes)
);

export const selectInputsList = pipe(
  selectInputNodes,
  map(inputs => Object.values(inputs))
);

interface EditingExpression {
  currentKey: string;
  expression?: string;
}
export const selectCurrentEditingExpression = (
  source: Observable<MapperState>
): Observable<null | EditingExpression> => {
  const sharedSource: Observable<MapperState> = source.pipe(shareReplay());
  return combineLatest(
    sharedSource.pipe(selectedInputKey),
    sharedSource.pipe(selectMappings)
  ).pipe(
    map(([currentKey, mappings]) => {
      if (!currentKey) {
        return null;
      }
      const nodeMappings = mappings[currentKey] || <MapExpression>{};
      return {
        currentKey,
        expression: nodeMappings.expression,
      };
    }),
    distinctUntilChanged(isEqual)
  );
};

export const selectCurrentNode = (source: Observable<MapperState>) => {
  const sharedSource = source.pipe(shareReplay());
  return combineLatest(
    sharedSource.pipe(selectedInputKey),
    sharedSource.pipe(selectInputNodes)
  ).pipe(
    map(([currentNodeKey, nodes]) =>
      currentNodeKey && nodes ? nodes[currentNodeKey] : null
    ),
    distinctUntilChanged()
  );
};

export const getCurrentNodeValueHints = (source: Observable<MapperState>) => {
  return source.pipe(
    selectCurrentNode,
    map(currentTreeNode =>
      currentTreeNode && currentTreeNode.hintOptions ? currentTreeNode.hintOptions : null
    ),
    distinctUntilChanged()
  );
};

export const selectFilteredNodes = (source: Observable<MapperState>) => {
  const sharedSource = source.pipe(shareReplay());
  return combineLatest(
    sharedSource.pipe(selectInputFilter),
    sharedSource.pipe(selectInputsList)
  ).pipe(
    map(([filterTerm, inputs]) => {
      if (!filterTerm || !filterTerm.trim()) {
        return inputs;
      }
      filterTerm = filterTerm.trim().toLowerCase();
      return inputs.filter(inputNode =>
        inputNode.label.toLowerCase().includes(filterTerm)
      );
    })
  );
};
