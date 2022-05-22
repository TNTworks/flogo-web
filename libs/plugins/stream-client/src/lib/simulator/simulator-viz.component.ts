import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
  NgZone,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Observable, combineLatest, pipe, Subscription } from 'rxjs';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { scan, filter, takeUntil, take, skipWhile } from 'rxjs/operators';
import { PerspectiveWorker, Table } from '@finos/perspective';
import { PerspectiveService } from './perspective.service';
import { HTMLPerspectiveViewerElement } from '@finos/perspective-viewer';

const VIZ_LIMIT = 20;

@Component({
  selector: 'flogo-stream-simulator-viz',
  templateUrl: './simulator-viz.component.html',
  styleUrls: ['./simulator-viz.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimulatorVizComponent implements OnDestroy, AfterViewInit, OnChanges {
  @Input() values$: Observable<any[]>;
  @Input() schema: { [name: string]: string };
  @Input() view: string;
  @Input() simulationId: number;
  @Input() graphView = 'd3_y_line';
  @Input() graphFields?;
  @ViewChild('viewer', { static: true }) viewerElem: ElementRef;

  public currentView;
  public currentTable: Table;
  public isStarting = true;
  private isReadyForChanges = false;
  private destroy$ = SingleEmissionSubject.create();
  private valueChangeSubscription: Subscription;

  constructor(
    private zone: NgZone,
    private cd: ChangeDetectorRef,
    private perspectiveService: PerspectiveService
  ) {}

  ngOnDestroy() {
    this.destroy$.emitAndComplete();
    this.currentTable = null;

    const viewer = this.getViewer();
    if (viewer) {
      viewer.delete(true);
    }
  }

  ngOnChanges({
    schema: schemaChanges,
    view: viewChanges,
    values$: values$Change,
  }: SimpleChanges) {
    if (!this.isReadyForChanges) {
      return;
    }
    if (values$Change) {
      this.configure();
    }
    if (viewChanges && this.view) {
      this.getViewer().setAttribute('view', this.view);
    }
  }

  private configure() {
    this.isStarting = true;
    if (this.currentTable) {
      // docs specify the `clear()` method but the typing doesn't, hence the cast to "any"
      (this.currentTable as any).clear();
    }

    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }

    this.zone.runOutsideAngular(() => {
      combineLatest(
        this.perspectiveService.getWorker(),
        this.values$.pipe(
          skipWhile(data => !data),
          valueAccumulator(this.simulationId)
        )
      )
        .pipe(takeUntil(this.destroy$), take(1))
        .subscribe(([worker, values]: [PerspectiveWorker, any[]]) => {
          const viewer = this.getViewer();
          const prevTable = this.currentTable;
          this.currentTable = worker.table(values, { limit: VIZ_LIMIT } as any);
          // docs say loading table is fine but TS complains, hence the cast to "any"
          viewer.load(this.currentTable as any);
          if (prevTable) {
            prevTable.delete();
          }

          if (this.view) {
            viewer.setAttribute('view', this.view);
          }
          // this.setColumns();
          this.listenForUpdates(this.currentTable);

          this.isStarting = false;
          this.cd.detectChanges();
        });
    });
  }

  ngAfterViewInit() {
    const viewer = this.getViewer();
    viewer.addEventListener('perspective-config-update', () => {
      const currentView = viewer.getAttribute('plugin');
      if (currentView !== this.currentView) {
        this.currentView = viewer.getAttribute('plugin');
        this.cd.markForCheck();
      }
    });
    this.isReadyForChanges = true;
    this.configure();
  }

  setView(viewName: string) {
    const viewer = this.getViewer();
    const currentViewName = viewer.getAttribute('view');
    if (currentViewName !== viewName) {
      this.currentView = viewName;
      // viewer.setAttribute('view', viewName);
      if (viewName === 'hypergrid') {
        setTimeout(() => (<any>viewer).reset(), 0);
      }
      // this.setColumns();
      // } else {
      //   this.setColumns(this.graphFields);
      // }
    }
  }

  private setColumns(columns?) {
    const stringifiedColumns = JSON.stringify(columns || Object.keys(this.schema));
    this.getViewer().setAttribute('columns', stringifiedColumns);
  }

  private getViewer(): HTMLPerspectiveViewerElement {
    return this.viewerElem && this.viewerElem.nativeElement;
  }

  private listenForUpdates(table) {
    if (this.valueChangeSubscription) {
      this.valueChangeSubscription.unsubscribe();
    }
    this.valueChangeSubscription = this.values$
      .pipe(takeUntil(this.destroy$), valueAccumulator(this.simulationId))
      .subscribe(values => {
        table.update(values);
      });
  }
}

const isDisplayable = n => n !== null && n !== undefined;
function accumulateValues(values, newValues) {
  values.unshift(...newValues.filter(isDisplayable));
  return values.slice(0, VIZ_LIMIT);
}

function isNotEmpty(values) {
  return values && values.length > 0;
}

function valueAccumulator(simulationId) {
  return pipe(
    filter((v: any) => v && v.__simulationId === simulationId),
    scan(accumulateValues, []),
    filter(isNotEmpty)
  );
}
