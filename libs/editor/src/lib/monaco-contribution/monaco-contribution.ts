import * as mode from './mode';
import { LanguageServiceDefaultsImpl } from './language-service-defaults-impl';
import { load as loadTokenizer } from './tokenizer';

export function mountFlogoMapperContribution() {
  const languageId = 'flogomapping';
  const diagnosticDefault: monaco.languages.json.DiagnosticsOptions = {};
  const langDefaults = new LanguageServiceDefaultsImpl(languageId, diagnosticDefault);

  monaco.languages.register({
    id: languageId,
    extensions: [],
  });
  monaco.languages.onLanguage(languageId, () => {
    mode.setupMode(langDefaults);
  });
  monaco.languages.setMonarchTokensProvider(languageId, <any>loadTokenizer());
  monaco.languages.setLanguageConfiguration(languageId, {
    brackets: [
      ['{', '}'],
      ['[', ']'],
    ],

    autoClosingPairs: [
      { open: '{', close: '}', notIn: [] },
      { open: '[', close: ']', notIn: ['string'] },
      { open: '"', close: '"', notIn: ['string'] },
    ],
  });

  monaco.editor.defineTheme(languageId, {
    base: 'vs',
    inherit: false,
    rules: [
      { token: 'string', foreground: '007f00' },
      { token: 'number', foreground: '005cc5' },
      { token: 'identifier', foreground: '24292e' },
      { token: 'operator', foreground: 'd73a49' },
      { token: 'keyword', foreground: 'd73a49' },
      { token: 'string-template.open', foreground: 'a28577' },
      { token: 'string-template.close', foreground: 'a28577' },
      { token: 'function.member', foreground: '6f42c1' },
      { token: 'function.call', foreground: '6f42c1' },
      { token: 'json.delimiter', foreground: '7a7a7a' },
      { token: 'json.key', foreground: '2b4fa7' },
      { token: 'json.string', foreground: 'bd4400' },
      { token: 'resolver.symbol', foreground: '1a7d7b' },
      { token: 'resolver.name', foreground: '1a7d7b' },
      { token: 'resolver.selector', foreground: '24292e' },
    ],
    colors: {
      'editorLineNumber.foreground': '#cad3df',
    },
  });
}
