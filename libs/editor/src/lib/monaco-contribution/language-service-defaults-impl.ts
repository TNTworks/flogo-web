export class LanguageServiceDefaultsImpl
  implements monaco.languages.json.LanguageServiceDefaults {
  private _onDidChange = new monaco.Emitter<
    monaco.languages.json.LanguageServiceDefaults
  >();
  private _diagnosticsOptions: monaco.languages.json.DiagnosticsOptions;
  private _languageId: string;

  constructor(
    languageId: string,
    diagnosticsOptions: monaco.languages.json.DiagnosticsOptions
  ) {
    this._languageId = languageId;
    this.setDiagnosticsOptions(diagnosticsOptions);
  }

  get onDidChange(): monaco.IEvent<monaco.languages.json.LanguageServiceDefaults> {
    return this._onDidChange.event;
  }

  get languageId(): string {
    return this._languageId;
  }

  get diagnosticsOptions(): monaco.languages.json.DiagnosticsOptions {
    return this._diagnosticsOptions;
  }

  setDiagnosticsOptions(options: monaco.languages.json.DiagnosticsOptions): void {
    this._diagnosticsOptions = options || Object.create(null);
    this._onDidChange.fire(this);
  }
}
