import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CdkDragDrop, CdkDrag, CdkDragStart } from '@angular/cdk/drag-drop';

import {
  DiagramAction,
  DiagramSelection,
  TaskTile,
  Tile,
  TileType,
  IconProvider,
} from '../interfaces';
import { actionEventFactory } from '../action-event-factory';
import { RowIndexService } from '../shared';
import { rowAnimations } from './diagram-row.animations';
import { trackTileByFn } from '../tiles/track-tile-by';
import { DragTileService, DragTilePosition, TilesGroupedByZone } from '../drag-tiles';
import { BRANCH_PREFIX } from '../constants';

@Component({
  selector: 'flogo-diagram-row',
  templateUrl: './diagram-row.component.html',
  styleUrls: ['./diagram-row.component.less'],
  animations: rowAnimations,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramRowComponent implements OnChanges {
  @Input() row: Tile[];
  @Input() selection: DiagramSelection;
  @Input() rowIndex: number;
  @Input() isDragging: boolean;
  @Input() iconProvider?: IconProvider;
  @HostBinding('class.is-readonly')
  @Input()
  isReadOnly = false;
  @Output() action = new EventEmitter<DiagramAction>();

  tileTypes = TileType;
  draggingPosition = DragTilePosition;
  groupedTiles: TilesGroupedByZone<Tile>;
  filledTiles: Array<Tile>;
  trackTileBy = trackTileByFn;

  restrictTileDrop = (dragEvent: CdkDrag) => {
    return this.dragService.isTileAllowedToDropInRow(dragEvent.data, this.rowIndex);
  };

  disableTile = id => {
    return id && !this.dragService.getTileDropAllowStatus(id).allow;
  };

  showInsertBtn = id =>
    this.dragService.getTileDropAllowStatus(id).allow && !this.isDragging;

  isPrevTileHasBranch = (tile: TaskTile) => {
    const parent = tile.parentId;
    if (parent && !parent.startsWith(BRANCH_PREFIX)) {
      const parentTile: TaskTile = <TaskTile>(
        this.groupedTiles.dropZone.find(
          (eachTile: TaskTile) => eachTile.task.id === parent
        )
      );
      return parentTile.task.children.find(child => child.startsWith(BRANCH_PREFIX));
    }
    return false;
  };

  constructor(
    private rowIndexService: RowIndexService,
    private dragService: DragTileService
  ) {}

  ngOnChanges({ row: rowChange }: SimpleChanges) {
    if (rowChange) {
      this.groupedTiles = this.dragService.groupTilesByZone(this.row);
      this.filledTiles = this.row.filter(
        tile => tile.type === TileType.Padding || tile.type === TileType.Task
      );
    }
  }

  calculateBranchSpan(taskTile: TaskTile) {
    const [parentId] = taskTile.task.parents;
    const parentRowIndex = this.rowIndexService.getRowIndexForTask(parentId);
    return this.rowIndex - parentRowIndex;
  }

  onInsertSelected(parentId: string) {
    this.action.emit(actionEventFactory.insert(parentId));
  }

  onTaskSelected(taskTile: TaskTile) {
    this.action.emit(actionEventFactory.select(taskTile.task.id));
  }

  onTaskAction(action: DiagramAction) {
    this.action.emit(action);
  }

  moveTile(event: CdkDragDrop<Tile[]>) {
    const dropActionData = this.dragService.prepareDropActionData(
      event,
      () => {
        const branchTile: TaskTile = this.groupedTiles.preDropZone.find(
          (tile: TaskTile) => tile.type === TileType.Task
        ) as TaskTile;
        return branchTile?.task.id;
      },
      dropPosition => {
        const dropZoneTiles = this.groupedTiles.dropZone;
        let dropTileId;
        let dropPositionInRow;
        if (dropPosition < dropZoneTiles.length) {
          const dropTile: TaskTile = dropZoneTiles[dropPosition] as TaskTile;
          dropTileId = dropTile.task.id;
          dropPositionInRow = this.filledTiles.findIndex(
            (tile: TaskTile) => tile.task?.id === dropTileId
          );
        } else {
          /* When tile is dropped after the last tile of the droplist  */
          dropPositionInRow = this.filledTiles.length;
        }
        return { dropTileId, dropPositionInRow };
      }
    );
    if (dropActionData) {
      const { itemId, parentId } = dropActionData;
      this.action.emit(actionEventFactory.move(itemId, parentId));
    }
  }

  updateDraggingState(pos: DragTilePosition, buttons: number) {
    this.dragService.changeDraggingTracker(pos, buttons);
  }

  onTaskDragStart(dragStartEvent: CdkDragStart) {
    this.dragService.updateTilesDropAllowStatus(dragStartEvent.source.data);
  }
}
