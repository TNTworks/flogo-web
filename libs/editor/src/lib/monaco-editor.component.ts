import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { map, takeUntil, take } from 'rxjs/operators';

import {
  EditorConstructOptions,
  ICursorPositionChangedEvent,
  ICursorSelectionChangedEvent,
  IStandaloneCodeEditor,
  LineRange,
} from './monaco.types';
import {
  ClientPosition,
  CompletionProvider,
  EditorError,
  HoverProvider,
  OffsetRange,
} from './types';
import { DisposableTracker } from './disposable-tracker';
import { MonacoEditorLoaderService } from './loader';

const SOURCE_ID = 'ngx-monaco-editor';
const LANGUAGE_ID = 'flogomapping';
export const DEFAULT_EDITOR_OPTIONS: EditorConstructOptions = {
  language: LANGUAGE_ID,
  theme: LANGUAGE_ID,
  fontSize: 13,
  glyphMargin: false,
  lineNumbersMinChars: 3,
  fixedOverflowWidgets: true,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  minimap: {
    enabled: false,
  },
};

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'monaco-editor',
  styleUrls: ['monaco-editor.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MonacoEditorComponent,
      multi: true,
    },
  ],
  template: `
    <div
      #editor
      class="editor-container"
      [class.is-disabled]="isDisabled"
      [style.width]="'100%'"
      [style.height]="'100%'"
    ></div>
    <div class="editor-spinner" *ngIf="!(ready | async)">
      <div class="editor-spinner__indicator">
        <svg viewBox="0 0 64 64">
          <g stroke-width="0">
            <circle cx="24" cy="0" transform="translate(32,32)" r="6.93333">
              <animate
                attributeName="r"
                dur="750ms"
                values="8;7;6;5;4;3;2;1;8"
                repeatCount="indefinite"
              ></animate>
            </circle>
            <circle
              cx="16.970562748477143"
              cy="16.97056274847714"
              transform="translate(32,32)"
              r="7.93333"
            >
              <animate
                attributeName="r"
                dur="750ms"
                values="1;8;7;6;5;4;3;2;1"
                repeatCount="indefinite"
              ></animate>
            </circle>
            <circle
              cx="1.4695761589768238e-15"
              cy="24"
              transform="translate(32,32)"
              r="1.46666"
            >
              <animate
                attributeName="r"
                dur="750ms"
                values="2;1;8;7;6;5;4;3;2"
                repeatCount="indefinite"
              ></animate>
            </circle>
            <circle
              cx="-16.97056274847714"
              cy="16.970562748477143"
              transform="translate(32,32)"
              r="1.93333"
            >
              <animate
                attributeName="r"
                dur="750ms"
                values="3;2;1;8;7;6;5;4;3"
                repeatCount="indefinite"
              ></animate>
            </circle>
            <circle
              cx="-24"
              cy="2.9391523179536475e-15"
              transform="translate(32,32)"
              r="2.93333"
            >
              <animate
                attributeName="r"
                dur="750ms"
                values="4;3;2;1;8;7;6;5;4"
                repeatCount="indefinite"
              ></animate>
            </circle>
            <circle
              cx="-16.970562748477143"
              cy="-16.97056274847714"
              transform="translate(32,32)"
              r="3.93333"
            >
              <animate
                attributeName="r"
                dur="750ms"
                values="5;4;3;2;1;8;7;6;5"
                repeatCount="indefinite"
              ></animate>
            </circle>
            <circle
              cx="-4.408728476930472e-15"
              cy="-24"
              transform="translate(32,32)"
              r="4.93333"
            >
              <animate
                attributeName="r"
                dur="750ms"
                values="6;5;4;3;2;1;8;7;6"
                repeatCount="indefinite"
              ></animate>
            </circle>
            <circle
              cx="16.970562748477136"
              cy="-16.970562748477143"
              transform="translate(32,32)"
              r="5.93333"
            >
              <animate
                attributeName="r"
                dur="750ms"
                values="7;6;5;4;3;2;1;8;7"
                repeatCount="indefinite"
              ></animate>
            </circle>
          </g>
        </svg>
      </div>
    </div>
  `,
})
export class MonacoEditorComponent
  implements AfterViewInit, OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('editor', { static: true }) editorRef: ElementRef;

  @Input() editorOptions: EditorConstructOptions = {};
  @Input() hoverProvider: HoverProvider = null;
  @Input() completionProvider: CompletionProvider = null;

  @Output() valueChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() cursorChange: EventEmitter<ICursorPositionChangedEvent> = new EventEmitter<
    ICursorPositionChangedEvent
  >();
  @Output() selectionChange: EventEmitter<
    ICursorSelectionChangedEvent
  > = new EventEmitter<ICursorSelectionChangedEvent>();
  @Output() blur: EventEmitter<void> = new EventEmitter<void>();

  @Output() ready: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() formValueWriteTransformerFn?: (value: any) => string;
  @Input() formValueChangeTransformerFn?: (value: string) => any;
  @Input() shouldUpdateValue?: (currentValue: string, newValue: any) => boolean;

  editor: IStandaloneCodeEditor;
  isDisabled = false;
  public isEditorLoading: boolean;
  private _disposed = false;
  private _internalHoverProvider = null;
  private _disposables = new DisposableTracker();
  private destroyed = new Subject();
  private _value = '';

  constructor(private ngZone: NgZone, private loader: MonacoEditorLoaderService) {}

  get value() {
    return this.editor.getValue();
  }

  @Input()
  set value(val: string) {
    val = val || '';
    this._value = val;
    if (this.editor && this.editor.getValue() !== val) {
      this.editor.setValue(val);
    }
  }

  ngOnInit() {
    this.isEditorLoading = true;
    this.ready.pipe(take(1)).subscribe(() => this.updateDimensions());
  }

  insert(text: string, range?: OffsetRange | LineRange) {
    let monacoRange: monaco.Range = null;
    if (range) {
      monacoRange = this.createMonacoRangeInstance(range);
    } else {
      const {
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn,
      } = this.determineRangeToInsertTo();
      monacoRange = new monaco.Range(
        startLineNumber,
        startColumn,
        endLineNumber,
        endColumn
      );
    }

    this.insertText(text, monacoRange);
  }

  insertAtClientPosition(text: string, clientPosition: ClientPosition) {
    const target = this.editor.getTargetAtClientPoint(clientPosition.x, clientPosition.y);
    if (target && target.position) {
      const { lineNumber, column } = target.position;
      this.insertText(
        text,
        this.createMonacoRangeInstance({
          startLineNumber: lineNumber,
          startColumn: column,
          endLineNumber: lineNumber,
          endColumn: column,
        })
      );
    }
  }

  replaceTokenAtClientPosition(text: string, clientPosition: ClientPosition) {
    const range = this.getRangeForTokenAtClientPosition(clientPosition);
    if (range) {
      this.insertText(text, monaco.Range.lift(range));
    } else {
      this.insert(text);
    }
  }

  selectTokenAtClientPosition(clientPosition: ClientPosition) {
    const range = this.getRangeForTokenAtClientPosition(clientPosition);
    if (!range) {
      return;
    }

    this.editor.setSelection(monaco.Selection.lift(range));
  }

  setCursorAtClientPosition(clientPosition: ClientPosition) {
    const target = this.editor.getTargetAtClientPoint(clientPosition.x, clientPosition.y);
    const newPosition = target ? target.position : null;
    if (newPosition && !newPosition.equals(this.editor.getPosition())) {
      this.editor.setPosition(target.position);
      this.editor.focus();
    }
  }

  focus() {
    this.editor.focus();
  }

  changeModel(value: string, mode?: string) {
    if (this._disposed) {
      return;
    }
    this._value = value;
    mode = mode || DEFAULT_EDITOR_OPTIONS.language;

    if (!this.editor) {
      this.editorOptions.language = mode;
      // changes should be taken from _value when editor initializes
      return;
    }

    const oldModel = this.editor.getModel();
    const newModel = monaco.editor.createModel(value, mode);
    this.editor.setModel(newModel);
    if (oldModel) {
      oldModel.dispose();
    }
  }

  hasErrors() {
    if (this._disposed || !this.editor) {
      return false;
    }

    const model = this.editor.getModel();
    if (model) {
      const markers = monaco.editor.getModelMarkers({ owner: SOURCE_ID });
      return (
        Boolean(markers) &&
        markers.find(marker => marker.severity === monaco.MarkerSeverity.Error) != null
      );
    }
    return false;
  }

  setErrors(errors?: EditorError[]) {
    if (this._disposed || !this.editor) {
      return;
    }

    const model = this.editor.getModel();
    if (!model) {
      return;
    }

    const errorMarkers =
      errors && errors.length
        ? errors.map((e: EditorError) => this.errorToMarker(e))
        : [];
    monaco.editor.setModelMarkers(model, SOURCE_ID, errorMarkers);
  }

  ngAfterViewInit() {
    if (this._disposed) {
      return;
    }
    this.ngZone.runOutsideAngular(() =>
      this.loader.load().subscribe(() => this.initMonaco())
    );
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();

    if (this._disposed) {
      return;
    }
    this._disposed = true;

    // Close possibly loaded editor component
    if (this.editor) {
      this.editor.dispose();
    }
    this.editor = null;
    this._disposables.disposeAll();
    if (this._internalHoverProvider) {
      this._internalHoverProvider.dispose();
    }
    this._internalHoverProvider = null;
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.updateDimensions();
  }

  updateDimensions(dimension?: { width: number; height: number }) {
    setTimeout(() => {
      if (this.editor) {
        this.editor.layout(dimension);
      }
    }, 0);
  }

  registerOnChange(onChange) {
    this.valueChange
      .pipe(
        takeUntil(this.destroyed),
        map(value =>
          this.formValueChangeTransformerFn
            ? this.formValueChangeTransformerFn(value)
            : value
        )
      )
      .subscribe(onChange);
  }

  registerOnTouched(listener: any) {
    this.blur.pipe(takeUntil(this.destroyed)).subscribe(listener);
  }

  setDisabledState(isDisabled: boolean) {
    this.isDisabled = isDisabled;
    if (this.editor) {
      this.editor.updateOptions({ readOnly: isDisabled });
    }
  }

  writeValue(value: any) {
    if (
      this.shouldUpdateValue &&
      this.editor &&
      !this.shouldUpdateValue(this.editor.getValue(), value)
    ) {
      return;
    }
    if (this.formValueWriteTransformerFn) {
      value = this.formValueWriteTransformerFn(value);
    }
    this.value = value;
  }

  private initMonaco() {
    const editorOptions = {
      ...DEFAULT_EDITOR_OPTIONS,
      ...this.editorOptions,
      value: this._value,
      readOnly: this.isDisabled,
    };
    const languageId = this.getLanguageId();
    // Register a new language
    monaco.languages.register({ id: languageId });

    // Register a tokens provider for the language
    this.editor = monaco.editor.create(this.editorRef.nativeElement, editorOptions);
    this.setupResizeObserver();

    const ngZone = fn => (event?) => this.ngZone.run(() => fn(event));

    this._disposables.add(
      this.editor.onDidChangeModelContent(ngZone(() => this.onDidChangeContent())),
      this.editor.onDidChangeCursorPosition(
        ngZone(event => this.onDidChangeCursorPosition(event))
      ),
      this.editor.onDidChangeCursorSelection(
        ngZone(event => this.onDidChangeCursorSelection(event))
      ),
      this.editor.onDidBlurEditorWidget(ngZone(() => this.blur.emit()))
    );

    const didScrollChangeDisposable = this.editor.onDidScrollChange(event => {
      didScrollChangeDisposable.dispose();
      // allow monaco event handlers to execute
      setTimeout(
        ngZone(() => {
          this.isEditorLoading = false;
          this.ready.next(true);
        }),
        0
      );
    });
  }

  private onDidChangeContent() {
    const value: string = this.editor.getModel().getValue();
    this._value = value;
    this.valueChange.next(value);
  }

  private onDidChangeCursorPosition(event: ICursorPositionChangedEvent) {
    const offset = this.editor.getModel().getOffsetAt(event.position);
    this.cursorChange.next(event);
  }

  private onDidChangeCursorSelection(event: ICursorSelectionChangedEvent) {
    const model = this.editor.getModel();

    const startPostion = event.selection.getStartPosition();
    const offsetStart = model.getOffsetAt(startPostion);

    const endPosition = event.selection.getEndPosition();
    const offsetEnd = model.getOffsetAt(endPosition);

    this.selectionChange.next(event);
  }

  private createMonacoRangeInstance(range: OffsetRange | LineRange) {
    if (range && (<OffsetRange>range).endOffset) {
      return this.rangeInstanceFromOffsetRange(<OffsetRange>range);
    } else {
      return this.rangeInstanceFromLineRange(<LineRange>range);
    }
  }

  private rangeInstanceFromOffsetRange(offsetRange: OffsetRange) {
    const model = this.editor.getModel();
    const startPosition = model.getPositionAt(offsetRange.startOffset);
    const endPosition = model.getPositionAt(offsetRange.endOffset);
    const startLineNumber = startPosition.lineNumber;
    const startColumn = startPosition.column;
    const endLineNumber = endPosition.lineNumber;
    const endColumn = endPosition.column;
    return new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn);
  }

  private rangeInstanceFromLineRange(lineRange: LineRange) {
    const { startLineNumber, startColumn, endLineNumber, endColumn } = lineRange;
    return new monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn);
  }

  private errorToMarker(e: EditorError) {
    const {
      startLineNumber,
      startColumn,
      endColumn,
      endLineNumber,
    } = this.createMonacoRangeInstance(e.location);
    return {
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      severity: monaco.MarkerSeverity.Error,
      message: e.message,
    };
  }

  private determineRangeToInsertTo(): monaco.IRange {
    const selection = this.editor.getSelection();
    return {
      startLineNumber: selection.selectionStartLineNumber,
      startColumn: selection.selectionStartColumn,
      endLineNumber: selection.positionLineNumber,
      endColumn: selection.positionColumn,
    };
  }

  private getLanguageId() {
    // return this.editor.getModel().getModeId();
    return LANGUAGE_ID;
  }

  private insertText(text: string, range: monaco.Range) {
    this.editor.executeEdits(SOURCE_ID, [
      {
        text,
        range,
        forceMoveMarkers: true,
      },
    ]);
  }

  private getRangeForTokenAtClientPosition(
    clientPosition: ClientPosition
  ): monaco.IRange | null {
    const target = this.editor.getTargetAtClientPoint(clientPosition.x, clientPosition.y);
    if (!target || !target.position) {
      return null;
    }
    const position = target.position;
    // // default is target position (range of width 0) for the case where target is not a token or editor is empty
    // const range = {
    //   startLineNumber: position.lineNumber,
    //   startColumn: position.column,
    //   endLineNumber: position.lineNumber,
    //   endColumn: position.column
    // };

    const word = this.editor.getModel().getWordAtPosition(position);
    if (word) {
      return {
        startLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endLineNumber: position.lineNumber,
        endColumn: word.endColumn,
      };
    }
    return null;
  }

  private setupResizeObserver() {
    // only available in chrome
    const ResizeObserver: {
      new (callback: Function);
      observe: (target: Element) => void;
      disconnect: () => void;
    } = (<any>window).ResizeObserver;
    if (!ResizeObserver) {
      return;
    }
    const resizeObserver = new ResizeObserver(() => {
      if (this.editor && !this._disposed) {
        this.updateDimensions();
      }
    });
    resizeObserver.observe(this.editorRef.nativeElement);
    this.destroyed.pipe(take(1)).subscribe(() => resizeObserver.disconnect());
  }
}
