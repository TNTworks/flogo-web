import { Injectable } from '@angular/core';
import perspective, { PerspectiveWorker } from '@finos/perspective';
import { Observable, ReplaySubject, fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PerspectiveService {
  worker: PerspectiveWorker;
  private readyWorkerSrc = new ReplaySubject<PerspectiveWorker>(1);
  private readyWorker$ = this.readyWorkerSrc.asObservable();

  constructor() {}

  getWorker(): Observable<PerspectiveWorker> {
    if (!this.worker) {
      this.initWorker();
    }
    return this.readyWorker$;
  }

  private initWorker() {
    this.worker = perspective.worker();
    fromEvent(window, 'perspective-ready')
      .pipe(take(1))
      .subscribe(() => this.readyWorkerSrc.next(this.worker));
  }
}
