import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  TrackByFunction,
} from '@angular/core';

import { FlowGraph, SingleEmissionSubject } from '@flogo-web/lib-client/core';

import {
  DiagramAction,
  DiagramSelection,
  TaskTile,
  Tile,
  IconProvider,
} from '../interfaces';
import { EMPTY_MATRIX, RowIndexService } from '../shared';
import { makeRenderableMatrix, TileMatrix } from '../renderable-model';
import { diagramAnimations } from './diagram.animations';
import { diagramRowTracker } from './diagram-row-tracker';
import { DragTileService } from '../drag-tiles';
import { MAX_ROW_LENGTH } from '../constants';
import { takeUntil } from 'rxjs/operators';

@Component({
  // temporal name until old diagram implementation is removed
  selector: 'flogo-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.less'],
  providers: [RowIndexService],
  animations: diagramAnimations,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramComponent implements OnChanges, OnDestroy {
  @HostBinding('@list') animateList = true;
  @Input() flow: FlowGraph;
  @Input() selection: DiagramSelection;
  @Input() diagramId?: string;
  @Input() iconProvider?: IconProvider;
  @Input() @HostBinding('class.flogo-diagram-is-readonly') isReadOnly = false;
  @Output() action = new EventEmitter<DiagramAction>();
  tileMatrix: TileMatrix;
  isDragging: boolean;

  trackRowBy: TrackByFunction<Tile[]>;

  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(
    private rowIndexService: RowIndexService,
    private dragService: DragTileService
  ) {
    this.trackRowBy = diagramRowTracker(this);
    this.dragService.isDragging$
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(isDragging => (this.isDragging = isDragging));
  }

  ngOnChanges({ flow: flowChange, isReadOnly: readOnlyChange }: SimpleChanges) {
    const readOnlyDidChange =
      readOnlyChange && readOnlyChange.currentValue !== readOnlyChange.previousValue;
    if (flowChange || readOnlyDidChange) {
      this.updateMatrix();
      this.dragService.initTilesDropAllowStatus(this.flow, tileId => {
        const tileRowIndex = this.rowIndexService.getRowIndexForTask(tileId);
        // calculate rowIndex as matrix is reversed to make sure html stack order always goes from bottom to top
        const rowIndex = this.tileMatrix.length - tileRowIndex - 1;
        return this.tileMatrix[rowIndex].findIndex(
          (tile: TaskTile) => tile.task?.id === tileId
        );
      });
    }
  }

  ngOnDestroy() {
    this.rowIndexService.clear();
    this.ngDestroy$.emitAndComplete();
  }

  onAction(action: DiagramAction) {
    this.action.emit({ ...action, diagramId: this.diagramId });
  }

  private updateMatrix() {
    const tileMatrix = makeRenderableMatrix(this.flow, MAX_ROW_LENGTH, this.isReadOnly);
    this.rowIndexService.updateRowIndexes(tileMatrix);
    if (tileMatrix.length > 0) {
      // matrix is reversed to make sure html stack order always goes from bottom to top
      // i.e. top rows are rendered in front of bottom rows, this ensures branches don't display on top of the tiles above
      this.tileMatrix = tileMatrix.reverse();
      this.updateRowParents();
    } else if (!this.isReadOnly) {
      this.tileMatrix = EMPTY_MATRIX;
    }
  }

  private updateRowParents() {
    this.dragService.updateRowParents(this.tileMatrix, taskId =>
      this.rowIndexService.getRowIndexForTask(taskId)
    );
  }
}
