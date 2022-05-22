import { IDisposable } from './monaco.types';

export class DisposableTracker {
  disposables: IDisposable[] = [];
  add(...disposables: IDisposable[]) {
    this.disposables.push(...disposables);
  }
  disposeAll() {
    this.disposables.forEach(d => d.dispose());
  }
}
