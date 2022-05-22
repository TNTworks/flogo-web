import { isTaskTile, isInsertTile } from '../shared';
import { Tile } from '../interfaces';
import { TrackByFunction } from '@angular/core';

export const trackTileByFn: TrackByFunction<Tile> = (_, tile: Tile) => {
  if (isTaskTile(tile)) {
    return tile.task.id;
  } else if (isInsertTile(tile)) {
    return `insert::${tile.parentId}`;
  } else {
    return tile.type;
  }
};
