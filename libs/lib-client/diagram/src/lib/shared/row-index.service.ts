import { Injectable } from '@angular/core';
import { TileMatrix } from '../renderable-model';
import { Tile } from '../interfaces';
import { isTaskTile } from './tile-guards';

@Injectable()
export class RowIndexService {
  private rowIndexes: Map<string, number>;

  updateRowIndexes(tileMatrix: TileMatrix) {
    const indexMap = new Map<string, number>();
    const addTask = (tile: Tile, rowIndex: number) => {
      if (isTaskTile(tile)) {
        indexMap.set(tile.task.id, rowIndex);
      }
    };
    const accumulateAllTasks = (row: Tile[], rowIndex: number) =>
      row.forEach(tile => addTask(tile, rowIndex));
    tileMatrix.forEach(accumulateAllTasks);
    this.rowIndexes = indexMap;
  }

  getRowIndexForTask(taskId: string) {
    return this.rowIndexes.get(taskId);
  }

  clear() {
    if (this.rowIndexes) {
      this.rowIndexes.clear();
    }
  }
}
