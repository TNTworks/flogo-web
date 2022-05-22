import Uri = monaco.Uri;
import IDisposable = monaco.IDisposable;
import { LexingError, RecognitionException } from '@flogo-web/parser';
import { LanguageService } from './language-service';

// --- diagnostics --- ---

export class DiagnosticsAdapter {
  private _disposables: IDisposable[] = [];
  private _listener: { [uri: string]: IDisposable } = Object.create(null);

  constructor(private _languageId: string) {
    const onModelAdd = (model: monaco.editor.IModel): void => {
      const modeId = model.getModeId();
      if (modeId !== this._languageId) {
        return;
      }

      let handle: number;
      this._listener[model.uri.toString()] = model.onDidChangeContent(() => {
        clearTimeout(handle);
        handle = <any>setTimeout(() => this._doValidate(model.uri, modeId), 500);
      });

      this._doValidate(model.uri, modeId);
    };

    const onModelRemoved = (model: monaco.editor.IModel): void => {
      monaco.editor.setModelMarkers(model, this._languageId, []);
      const uriStr = model.uri.toString();
      const listener = this._listener[uriStr];
      if (listener) {
        listener.dispose();
        delete this._listener[uriStr];
      }
    };

    this._disposables.push(monaco.editor.onDidCreateModel(onModelAdd));
    this._disposables.push(
      monaco.editor.onWillDisposeModel(model => {
        onModelRemoved(model);
        this._resetSchema(model.uri);
      })
    );
    this._disposables.push(
      monaco.editor.onDidChangeModelLanguage(event => {
        onModelRemoved(event.model);
        onModelAdd(event.model);
        this._resetSchema(event.model.uri);
      })
    );

    this._disposables.push({
      dispose: () => {
        Object.keys(this._listener).forEach(key => {
          this._listener[key].dispose();
        });
      },
    });

    monaco.editor.getModels().forEach(onModelAdd);
  }

  public dispose(): void {
    this._disposables.forEach(d => d && d.dispose());
    this._disposables = [];
  }

  private _resetSchema(resource: Uri): void {
    // this._worker().then(worker => {
    //   worker.resetSchema(resource.toString());
    // });
  }

  private _doValidate(resource: Uri, languageId: string): void {
    const initialModel = monaco.editor.getModel(resource);
    if (!initialModel) {
      return;
    }
    LanguageService.doValidation(initialModel.getValue()).then(diagnostics => {
      const model = monaco.editor.getModel(resource);
      if (model.getModeId() === languageId) {
        const markers = diagnostics.map(d => toDiagnostics(resource, d));
        monaco.editor.setModelMarkers(model, languageId, markers);
      }
    });

    // this._worker(resource).then(worker => {
    //   return worker.doValidation(resource.toString()).then(diagnostics => {
    //     const markers = diagnostics.map(d => toDiagnostics(resource, d));
    //     const model = monaco.editor.getModel(resource);
    //     if (model.getModeId() === languageId) {
    //       monaco.editor.setModelMarkers(model, languageId, markers);
    //     }
    //   });
    // }).then(undefined, err => {
    //   console.error(err);
    // });
  }
}
//
//
// function toSeverity(lsSeverity: number): monaco.Severity {
//   switch (lsSeverity) {
//     case ls.DiagnosticSeverity.Error: return monaco.Severity.Error;
//     case ls.DiagnosticSeverity.Warning: return monaco.Severity.Warning;
//     case ls.DiagnosticSeverity.Information:
//     case ls.DiagnosticSeverity.Hint:
//     default:
//       return monaco.Severity.Info;
//   }
// }

//
function toDiagnostics(
  resource: Uri,
  diagnostic: RecognitionException | LexingError
): monaco.editor.IMarkerData {
  if ((<RecognitionException>diagnostic).token) {
    return parseExceptionToMarker(<RecognitionException>diagnostic);
  } else {
    return lexErrorToMarker(resource, <LexingError>diagnostic);
  }
}

const tokenToPosition = (token: RecognitionException['token']) => ({
  startLineNumber: token.startLine,
  startColumn: token.startColumn,
  endLineNumber: token.endLine,
  endColumn: token.endColumn,
});
const missingToken = (token: RecognitionException['token']) => ({
  startLineNumber: token.startLine,
  startColumn: token.endColumn + 1,
  endLineNumber: token.endLine,
  endColumn: token.endColumn + 2,
});
function parseExceptionToMarker(
  exception: RecognitionException
): monaco.editor.IMarkerData {
  let positionInfo = tokenToPosition(exception.token);
  //
  if (isNaN(exception.token.startOffset) && (<any>exception).previousToken) {
    positionInfo = missingToken((<any>exception).previousToken);
  }
  return {
    code: exception.name,
    severity: monaco.MarkerSeverity.Error,
    message: exception.message,
    ...positionInfo,
  };
}

function lexErrorToMarker(
  resource: monaco.Uri,
  lexingError: LexingError
): monaco.editor.IMarkerData {
  const model = monaco.editor.getModel(resource);
  const startPosition = model.getPositionAt(lexingError.offset);
  const endPosition = model.getPositionAt(lexingError.offset + lexingError.length);
  return {
    severity: monaco.MarkerSeverity.Error,
    message: lexingError.message,
    startLineNumber: startPosition.lineNumber,
    startColumn: startPosition.column,
    endLineNumber: endPosition.lineNumber,
    endColumn: endPosition.column,
  };
}
