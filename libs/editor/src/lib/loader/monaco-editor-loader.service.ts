import { Injectable, Injector, Compiler, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, switchMap, filter, shareReplay, tap } from 'rxjs/operators';
import { mountFlogoMapperContribution } from '../monaco-contribution';

@Injectable({
  providedIn: 'root',
})
export class MonacoEditorLoaderService {
  isMonacoLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private loaded$ = this.isMonacoLoaded.pipe(filter<boolean>(Boolean), shareReplay(1));
  private _monacoPath = 'assets/monaco-editor/vs';

  set monacoPath(value) {
    if (value) {
      this._monacoPath = value;
    }
  }

  constructor(
    private injector: Injector,
    private compiler: Compiler,
    private ngZone: NgZone
  ) {}

  load(): Observable<boolean> {
    return this.isMonacoLoaded.pipe(
      take(1),
      tap(isLoaded => {
        if (!isLoaded) {
          this.lazyLoadMonacoLibrary();
        }
      }),
      switchMap(() => this.loaded$)
    );
  }

  private lazyLoadMonacoLibrary() {
    return this.ngZone.runOutsideAngular(() => {
      (window as any).require.config({ paths: { vs: this._monacoPath } });
      (window as any).require(['vs/editor/editor.main'], () => {
        mountFlogoMapperContribution();
        this.ngZone.run(() => this.isMonacoLoaded.next(true));
      });
    });
  }
}
