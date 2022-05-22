import {
  Component,
  NgZone,
  OnInit,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

import { Observable, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { Metadata, ValueType } from '@flogo-web/core';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { SimulatorService } from './simulator.service';

interface Schemas {
  input?: { [field: string]: string };
  output?: { [field: string]: string };
}

@Component({
  selector: 'flogo-stream-simulator',
  templateUrl: './simulator.component.html',
  styleUrls: ['./simulator.component.less'],
})
export class SimulatorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() metadata?: Metadata & {
    inputGraph: string;
    outputGraph: string;
    inputGraphFields?: string[];
  };
  @Input() simulateActivity;
  @Input() simulationId: number;
  @Input() currentStageId: string | number;

  isInputEmpty = true;
  isOutputEmpty = true;

  iconUrl: string;

  private updateSubs: Subscription[] = [];
  private destroy$ = SingleEmissionSubject.create();
  private input$: Observable<any>;
  private output$: Observable<any>;
  private schemas: Schemas;
  constructor(private zone: NgZone, private simulationService: SimulatorService) {}

  ngOnInit() {
    this.updateEvents();
    this.simulationService.start$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.updateEvents());
  }

  ngOnChanges({
    metadata: metadataChange,
    currentStageId: currentStageIdChange,
    simulateActivity: activityChange,
  }: SimpleChanges) {
    if (currentStageIdChange) {
      this.updateEvents();
    }
    if (activityChange && this.simulateActivity) {
      this.iconUrl = this.simulateActivity.icon;
    }
  }

  ngOnDestroy() {
    this.destroy$.emitAndComplete();
  }

  updateSchemas() {
    this.schemas = {};
    if (!this.metadata) {
      return;
    }

    const translateFields = fieldTranslator();

    if (this.metadata.input && this.metadata.input.length > 0) {
      this.schemas.input = this.metadata.input.reduce(translateFields, {});
    }

    if (this.metadata.output && this.metadata.output.length > 0) {
      this.schemas.output = this.metadata.output.reduce(translateFields, {});
    }
  }

  private updateEvents() {
    this.isInputEmpty = true;
    this.isOutputEmpty = true;

    if (this.updateSubs.length > 0) {
      this.updateSubs.forEach(s => s.unsubscribe());
    }

    this.input$ = this.simulationService
      .observeData(this.currentStageId, 'started')
      .pipe(takeUntil(this.destroy$));
    this.output$ = this.simulationService
      .observeData(this.currentStageId, 'finished')
      .pipe(takeUntil(this.destroy$));

    this.updateSubs = [
      this.input$.pipe(take(1)).subscribe(() => {
        this.isInputEmpty = false;
      }),
      this.output$.pipe(take(1)).subscribe(() => {
        this.isOutputEmpty = false;
      }),
    ];
  }
}

function fieldTranslator() {
  const translateFieldType = (type: ValueType) => {
    switch (type) {
      case ValueType.Double:
      case ValueType.Long:
        return 'float';
        break;
      case ValueType.Integer:
        return 'integer';
        break;
      case ValueType.Boolean:
        return 'boolean';
        break;
      default:
        return 'string';
        break;
    }
  };

  return (schema, field) => {
    schema[field.name] = translateFieldType(field.type);
    return schema;
  };
}
