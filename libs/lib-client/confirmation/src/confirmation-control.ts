import { Observable, Subject } from 'rxjs';
import { OverlayRef } from '@angular/cdk/overlay';
import { ConfirmationResult } from './confirmation-result';

export class ConfirmationControl {
  private resultSubscriber: Subject<ConfirmationResult>;
  result: Observable<ConfirmationResult>;

  constructor(private overlayRef: OverlayRef) {
    this.resultSubscriber = new Subject<ConfirmationResult>();
    this.result = this.resultSubscriber.asObservable();
  }

  confirm() {
    this.close(ConfirmationResult.Confirm);
  }

  discard() {
    this.close(ConfirmationResult.Discard);
  }

  cancel() {
    this.close(ConfirmationResult.Cancel);
  }

  private close(result: ConfirmationResult) {
    this.overlayRef.dispose();
    this.resultSubscriber.next(result);
    this.resultSubscriber.complete();
  }
}
