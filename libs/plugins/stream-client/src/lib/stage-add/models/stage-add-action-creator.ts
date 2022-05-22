import { assign } from 'lodash';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { NodeType, GraphNode } from '@flogo-web/lib-client/core';
import { uniqueStageName } from '@flogo-web/plugins/stream-core';

import { FlogoStreamState, StreamActions, StreamSelectors } from '../../core/state';
import { activitySchemaToStage } from './stage-factories';
import { stageIdGenerator } from './profile';
import { InsertTaskSelection, makeNode } from '../../core/models';
import { Item } from '../../core/interfaces';

interface StreamAddData {
  ref: string;
}

export function createStageAddAction(
  store: Store<FlogoStreamState>,
  activityToAdd: StreamAddData
): Observable<StreamActions.StageItemCreated> {
  return store.pipe(
    select(StreamSelectors.selectStreamState),
    take(1),
    map(
      streamState =>
        new StreamActions.StageItemCreated(createNewStage(streamState, activityToAdd))
    )
  );
}

function createNewStage(
  streamState: FlogoStreamState,
  activityData: StreamAddData
): StreamActions.StageItemCreated['payload'] {
  const selection = streamState.currentSelection as InsertTaskSelection;
  const schema = streamState.schemas[activityData.ref];
  const { mainItems } = streamState;
  const stage = createStage({
    activitySchema: schema,
    mainItems,
  });
  const isFinal = !!stage.return;
  const item: Item = createItem(stage);
  const node: Partial<GraphNode> = makeNode({
    id: stage.id,
    type: NodeType.Task,
    title: stage.name,
    description: stage.description,
    parents: [selection.parentId],
    features: {
      final: isFinal,
      canHaveChildren: !isFinal,
    },
  });
  return {
    item,
    node,
  };
}

function createStage({ activitySchema, mainItems }) {
  let stage = activitySchemaToStage(activitySchema);
  const stageName = uniqueStageName(stage.name, mainItems);
  stage = <Item>assign({}, stage, {
    id: stageIdGenerator({ ...mainItems }, stage),
    name: stageName,
  });
  return stage;
}

function createItem(stage): Item {
  return {
    id: stage.id,
    ref: stage.ref,
    name: stage.name,
    description: stage.description,
    inputMappings: stage.inputMappings,
    output: stage.outputMappings,
  };
}
