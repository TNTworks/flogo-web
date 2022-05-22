import { TileMatrix } from '../renderable-model';
import { TileType } from '../interfaces';

export const EMPTY_MATRIX: TileMatrix = [
  [
    {
      type: TileType.Insert,
      parentId: null,
      isRoot: true,
    },
  ],
];
