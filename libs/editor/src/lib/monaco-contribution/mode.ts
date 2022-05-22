import { LanguageServiceDefaultsImpl } from './language-service-defaults-impl';
import * as languageFeatures from './language-features';

import IDisposable = monaco.IDisposable;

export function setupMode(defaults: LanguageServiceDefaultsImpl): void {
  const disposables: IDisposable[] = [];
  const languageId = defaults.languageId;
  disposables.push(new languageFeatures.DiagnosticsAdapter(languageId));
}
