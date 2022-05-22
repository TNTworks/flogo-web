import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  shareReplay,
  switchMap,
  takeUntil,
  filter,
  map,
  startWith,
} from 'rxjs/operators';

import { MonacoEditorComponent, DEFAULT_EDITOR_OPTIONS } from '@flogo-web/editor';
import { SingleEmissionSubject } from '../shared/single-emission-subject';

import { MapperState } from '../models';
import { MapperService } from '../services/mapper.service';
import {
  selectCurrentEditingExpression,
  selectedInputKey,
  getCurrentNodeValueHints,
} from '../services/selectors';
import { EditorService, InsertEvent } from './editor.service';

function distinctAndDebounce(obs) {
  return obs.pipe(debounceTime(300), distinctUntilChanged());
}

interface EditorHint {
  label: string;
  value: string;
}

@Component({
  selector: 'flogo-mapper-editor',
  templateUrl: 'editor.component.html',
  styleUrls: ['editor.component.less'],
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild(MonacoEditorComponent, { static: true }) editor: MonacoEditorComponent;
  expression = '';
  valueHints$: Observable<null | Array<EditorHint>>;

  private currentMapKey: string;
  private ngDestroy: SingleEmissionSubject = SingleEmissionSubject.create();

  constructor(
    private editorService: EditorService,
    private mapperService: MapperService
  ) {}

  ngOnInit() {
    const mapperState$ = this.mapperService.state$.pipe(shareReplay());
    this.setupExternalModelChanges(mapperState$);

    const editorContext$ = mapperState$.pipe(selectedInputKey);
    this.valueHints$ = this.createHintsStream(
      editorContext$,
      mapperState$.pipe(getCurrentNodeValueHints)
    );
    this.subscribeToValueChanges(editorContext$);

    this.editorService.insert$
      .pipe(takeUntil(this.ngDestroy))
      .subscribe((event: InsertEvent) => {
        if (event.replaceTokenAtPosition) {
          this.editor.replaceTokenAtClientPosition(
            event.text,
            event.replaceTokenAtPosition
          );
        } else {
          this.editor.insert(event.text);
        }
        this.editor.focus();
      });

    this.editorService.dragOver$.pipe(takeUntil(this.ngDestroy)).subscribe(position => {
      this.editor.selectTokenAtClientPosition(position);
    });
  }

  onHintSelected(event: Event, hint: EditorHint) {
    this.editor.insert(hint.value);
    this.editor.focus();
    event.stopPropagation();
  }

  onHintOverlayClick() {
    this.editor.focus();
  }

  ngOnDestroy() {
    this.ngDestroy.emitAndComplete();
  }

  private subscribeToValueChanges(editorContext$) {
    const valueChange$ = distinctAndDebounce(this.editor.valueChange);
    editorContext$
      .pipe(
        switchMap(() => valueChange$),
        takeUntil(this.ngDestroy)
      )
      .subscribe((value: string) => {
        this.mapperService.expressionChange(this.currentMapKey, value);
      });
  }

  private setupExternalModelChanges(mapperState$: Observable<MapperState>) {
    this.editor.ready
      .pipe(
        switchMap(() => mapperState$.pipe(selectCurrentEditingExpression)),
        takeUntil(this.ngDestroy),
        filter(context => !!context)
      )
      .subscribe(context => {
        this.currentMapKey = context.currentKey;
        this.expression = context.expression;
        const newExpression = context.expression || '';
        if (this.editor.value !== newExpression) {
          this.editor.changeModel(newExpression, DEFAULT_EDITOR_OPTIONS.language);
          setTimeout(() => this.editor.onWindowResize(), 0);
        }
      });
  }

  private createHintsStream(
    editorContext$,
    currentNodeValueHints$: Observable<null | any[]>
  ) {
    const hasValues = a => a && a.length >= 0;
    const nodeHintsToEditorHints = nodeHints =>
      hasValues(nodeHints)
        ? nodeHints.map(value => ({
            label: value,
            value: JSON.stringify(value),
          }))
        : [];
    return this.editor.ready.pipe(
      switchMap(() => editorContext$),
      switchMap(() =>
        combineLatest(
          this.editor.valueChange.pipe(startWith(this.editor.value)),
          currentNodeValueHints$.pipe(map(nodeHintsToEditorHints))
        )
      ),
      map(([currentEditorValue, hints]) => (!currentEditorValue ? hints : null))
    );
  }
}
