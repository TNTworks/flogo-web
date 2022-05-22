import { GraphNode } from '@flogo-web/lib-client/core';
import { TileType, InsertTile, TaskTile } from '../interfaces';

const PaddingTile = {
  type: TileType.Padding,
};

const PlaceholderTile = {
  type: TileType.Placeholder,
};

export function makeInsertTile(parentId: string): InsertTile {
  return {
    type: TileType.Insert,
    parentId,
  };
}

export function makeTaskTile(
  task: GraphNode,
  isTerminalInRow = false,
  parentId: string
): TaskTile {
  return {
    type: TileType.Task,
    isTerminalInRow,
    task,
    parentId,
  };
}

export const tileFactory = {
  makePadding: () => PaddingTile,
  makePlaceholder: () => PlaceholderTile,
  makeTask: makeTaskTile,
  makeInsert: makeInsertTile,
};
