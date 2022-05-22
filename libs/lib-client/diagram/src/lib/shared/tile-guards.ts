import { Tile, TaskTile, InsertTile, TileType } from '../interfaces';

export function isTaskTile(tile: Tile): tile is TaskTile {
  return tile && tile.type === TileType.Task;
}

export function isInsertTile(tile: Tile): tile is InsertTile {
  return tile && tile.type === TileType.Insert;
}
