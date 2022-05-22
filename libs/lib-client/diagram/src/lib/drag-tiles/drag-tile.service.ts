import { groupBy, map, pickBy, cloneDeep } from 'lodash';
import { Injectable } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

import { GraphNodeDictionary, NodeType } from '@flogo-web/lib-client/core';

import { TaskTile, Tile, TileType } from '../interfaces';
import { DropActionData, TilesGroupedByZone } from './interface';
import { BRANCH_PREFIX, MAX_ROW_LENGTH } from '../constants';
import { Subject } from 'rxjs';

/* The following enum is based on the return value of MouseEvent.buttons as described in
    https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
 */
enum MouseButtonPressed {
  NO_BUTTON,
  PRIMARY_BUTTON,
}

export enum DragTilePosition {
  OUTSIDE,
  INSIDE,
}

interface TileDropAllowStatus {
  allow: boolean;
  occurrenceInMaxPaths: number;
}

const maxIndexInRow = MAX_ROW_LENGTH - 1;
const DRAG_CURSOR_STYLE_CLASS = 'cursor-grabbing';

@Injectable()
export class DragTileService {
  private rowAllParents: Map<number, string[]>;
  private isDragInsideContainer = false;
  private nodes: GraphNodeDictionary;
  private maxPaths: Array<string[]>;
  private tilesDropAllowStatus: Map<string, TileDropAllowStatus>;
  private tilesDropAllowStatusCopy: Map<string, TileDropAllowStatus>;
  private dragTileMaxStretch = 0;
  private getTileIndexInRow: (id: string) => number;
  private isDraggingSubscriber = new Subject<boolean>();
  isDragging$ = this.isDraggingSubscriber.asObservable();

  groupTilesByZone(allTiles: Tile[]): TilesGroupedByZone {
    const { preDropZone, dropZone, postDropZone } = groupBy(allTiles, (tile: Tile) => {
      switch (tile.type) {
        case TileType.Padding:
          return 'preDropZone';
        case TileType.Task: {
          const { task } = tile as TaskTile;
          if (task.type === NodeType.Branch) {
            return 'preDropZone';
          } else if (task?.features?.canHaveChildren) {
            return 'dropZone';
          }
          return 'postDropZone';
        }
        case TileType.Insert:
        case TileType.Placeholder:
          return 'postDropZone';
      }
    });
    return {
      preDropZone: preDropZone || [],
      dropZone: dropZone || [],
      postDropZone: postDropZone || [],
    };
  }

  prepareDropActionData(
    dropEvent: CdkDragDrop<Tile[]>,
    getBranchId?: () => string,
    getDropTileDetails?: (
      dropPosition: number
    ) => { dropTileId: string; dropPositionInRow: number }
  ): DropActionData {
    const { previousIndex, currentIndex, item, container, previousContainer } = dropEvent;

    this.updateDragAction(false);

    if (!this.isDragInsideContainer) {
      this.resetDropAllowStatus();
      return;
    }

    this.resetDraggingTracker();

    if (previousContainer === container && previousIndex === currentIndex) {
      /* Returning if the item is dropped in it's original place */
      this.resetDropAllowStatus();
      return;
    }

    if (getDropTileDetails) {
      const dropTileDetails = getDropTileDetails(currentIndex);
      const dropTileId = dropTileDetails.dropTileId;
      let isDropAllowed;
      if (dropTileId) {
        isDropAllowed = this.isDropAllowedOnDropTile(dropTileDetails.dropTileId);
      } else {
        /* When tile is dropped after the last tile of the droplist which is an empty slot */
        isDropAllowed =
          dropTileDetails.dropPositionInRow + this.dragTileMaxStretch <= maxIndexInRow;
      }
      if (!isDropAllowed) {
        this.resetDropAllowStatus();
        return;
      }
    }

    const taskTilesInContainer = container.getSortedItems();
    let parentId: string = null;

    if (currentIndex > 0) {
      if (previousContainer === container && currentIndex > previousIndex) {
        parentId = taskTilesInContainer[currentIndex]?.data;
      } else {
        parentId = taskTilesInContainer[currentIndex - 1]?.data;
      }
    } else if (getBranchId) {
      /* When the tile is dropped at the first place of a non-zero indexed row then
         the parent of the tile will be the branch tile in this row and calculated
         by consumer */
      parentId = getBranchId();
    }
    return {
      itemId: item.data,
      parentId,
    };
  }

  updateRowParents(tileMatrix, getRowIndex: (tileId: string) => number) {
    this.rowAllParents = new Map<number, string[]>();
    const rowParentMap = new Map<number, string>();
    const totalRows = tileMatrix.length;
    tileMatrix.forEach((row, index) => {
      const rowIndex = totalRows - index - 1;
      const branchTask = row.find(tile => {
        return tile?.task?.type === NodeType.Branch;
      });
      if (branchTask) {
        rowParentMap.set(rowIndex, branchTask.task.parents[0]);
      }
    });
    rowParentMap.forEach((rowParent, rowIndex) => {
      this.rowAllParents.set(
        rowIndex,
        this.getRowAllParents(rowParent, rowParentMap, getRowIndex)
      );
    });
  }

  isTileAllowedToDropInRow(tileId, rowIndex) {
    const rowParents = this.rowAllParents.get(rowIndex);
    return !rowParents?.length || !rowParents.includes(tileId);
  }

  changeDraggingTracker(position: DragTilePosition, buttonsActive: MouseButtonPressed) {
    if (buttonsActive === MouseButtonPressed.PRIMARY_BUTTON) {
      switch (position) {
        case DragTilePosition.INSIDE:
          this.isDragInsideContainer = true;
          break;
        case DragTilePosition.OUTSIDE:
        default:
          this.resetDraggingTracker();
      }
    }
  }

  private getRowAllParents(parentTile, rowParents, getRowIndex) {
    const allParentTiles = [];
    while (parentTile) {
      allParentTiles.push(parentTile);
      const parentRowIndex = getRowIndex(parentTile);
      parentTile = rowParents.get(parentRowIndex);
    }
    return allParentTiles;
  }

  private resetDraggingTracker() {
    this.isDragInsideContainer = false;
  }

  initTilesDropAllowStatus(flow, getTileIndexInRow) {
    this.nodes = {};
    this.maxPaths = new Array<string[]>();
    this.tilesDropAllowStatus = new Map<string, TileDropAllowStatus>();
    this.getTileIndexInRow = getTileIndexInRow;
    const rootId = flow.rootId;
    if (rootId) {
      this.nodes = flow.nodes;
      const allPaths = this.getPathsFromTile(rootId);
      this.maxPaths = allPaths.filter(path => path.length === MAX_ROW_LENGTH);
      this.setTileDropAllowStatus();
    }
  }

  getPathsFromTile(fromTile, path = [], allPaths = []) {
    if (this.isNonBranchTask(fromTile)) {
      path.push(fromTile);
    }
    const children = this.nodes[fromTile].children;
    if (children.length) {
      for (const child of children) {
        this.getPathsFromTile(child, [...path], allPaths);
      }
    } else {
      allPaths.push(path);
    }
    return allPaths;
  }

  setTileDropAllowStatus() {
    const nonBranchTasks = pickBy(this.nodes, (node, nodeId) =>
      this.isNonBranchTask(nodeId)
    );
    const taskIds = map(nonBranchTasks, (node, nodeId) => nodeId);
    taskIds.forEach(taskId => {
      this.tilesDropAllowStatus.set(taskId, this.tileDropAllowStatus(taskId));
    });
  }

  isNonBranchTask(taskId) {
    return !taskId.startsWith(BRANCH_PREFIX);
  }

  tileDropAllowStatus(tileId): TileDropAllowStatus {
    let occurrence = 0;
    this.maxPaths.forEach(path => {
      if (path.includes(tileId)) {
        occurrence++;
      }
    });
    return { allow: !occurrence, occurrenceInMaxPaths: occurrence };
  }

  isDropAllowedOnDropTile(dropTileId): boolean {
    return this.tilesDropAllowStatus.get(dropTileId).allow;
  }

  disableDropForBranchChildTiles(branchPaths) {
    branchPaths.forEach(path => {
      path.forEach(branchChildTile =>
        this.updateTileDropAllowStatus(branchChildTile, false)
      );
    });
  }

  disableDropIfTileOverFlowsRow(branchPaths) {
    this.dragTileMaxStretch = branchPaths.reduce((maxLength, path) => {
      const pathLength = path.length;
      return pathLength > maxLength ? pathLength : maxLength;
    }, 0);
    this.tilesDropAllowStatus.forEach((status, id) => {
      if (status.allow) {
        const tileIndexInRow = this.getTileIndexInRow(id);
        if (tileIndexInRow + this.dragTileMaxStretch > maxIndexInRow) {
          status.allow = false;
        }
      }
    });
  }

  getAllBranchPaths(branchTiles) {
    let branchPaths = [];
    branchTiles.forEach(
      branchTile => (branchPaths = branchPaths.concat(this.getPathsFromTile(branchTile)))
    );
    return branchPaths;
  }

  getAllBranchTiles(tileId) {
    const tile = this.nodes[tileId];
    const tileChildren = tile.children;
    return tileChildren.filter(child => child.startsWith(BRANCH_PREFIX));
  }

  updateTilesDropAllowStatus(tileId: string) {
    this.tilesDropAllowStatusCopy = cloneDeep(this.tilesDropAllowStatus);
    /* If drag tile is from one of the max paths */
    if (!this.getTileDropAllowStatus(tileId).allow) {
      const tilePaths = this.getTilePaths(tileId);
      tilePaths.forEach(path => this.updateDropStatusOfTilesInPath(tileId, path));
    }
    /* If drag tile has branch */
    const branchTiles = this.getAllBranchTiles(tileId);
    if (branchTiles.length) {
      const branchPaths = this.getAllBranchPaths(branchTiles);
      /* Disable drop for all branch child tiles */
      this.disableDropForBranchChildTiles(branchPaths);
      /* Disable drop for the tiles which will overflow the row if drag tile(with branch) is dropped on it */
      this.disableDropIfTileOverFlowsRow(branchPaths);
    } else {
      this.dragTileMaxStretch = 0;
    }
    this.updateDragAction(true);
  }

  getTilePaths(tileId) {
    return this.maxPaths.filter(path => path.includes(tileId));
  }

  updateDropStatusOfTilesInPath(dragTileId, tilePath) {
    const dragTileOccurrence = this.getTileDropAllowStatus(dragTileId)
      .occurrenceInMaxPaths;
    tilePath.forEach(tileId => {
      const tileDropStatus = this.getTileDropAllowStatus(tileId);
      if (tileDropStatus.occurrenceInMaxPaths <= dragTileOccurrence) {
        this.updateTileDropAllowStatus(tileId, true);
      }
    });
  }

  updateTileDropAllowStatus(tileId: string, allow) {
    const currentStatus = this.getTileDropAllowStatus(tileId);
    this.tilesDropAllowStatus.set(tileId, { ...currentStatus, allow });
  }

  getTileDropAllowStatus(tileId): TileDropAllowStatus {
    return this.tilesDropAllowStatus.get(tileId);
  }

  updateDragAction(dragState) {
    this.isDraggingSubscriber.next(dragState);
    this.toggleCursorStyle();
  }

  toggleCursorStyle() {
    document.querySelector('body').classList.toggle(DRAG_CURSOR_STYLE_CLASS);
  }

  resetDropAllowStatus() {
    /* Reset drop allow status map when tile drop reverts to it's original position
     *  Case 1: Tile dropped in its original position
     *  Case 2: Tile dropped outside drop list container
     *  Case 3: Tile cannot be dropped at a particular position as it will overflow the max tile limit of a row
     * */
    this.tilesDropAllowStatus = cloneDeep(this.tilesDropAllowStatusCopy);
  }
}
