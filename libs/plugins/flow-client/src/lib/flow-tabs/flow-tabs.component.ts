import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { takeUntil } from 'rxjs/operators';
import { SingleEmissionSubject } from '@flogo-web/lib-client/core';

import {
  FlowActions,
  FlowSelectors,
  FlowState,
  getErrorFlowHasExecutionErrors,
  getPrimaryFlowHasExecutionErrors,
} from '../core/state';

@Component({
  selector: 'flogo-flow-tabs',
  templateUrl: './flow-tabs.component.html',
  styleUrls: ['./flow-tabs.component.less'],
})
export class FlowTabsComponent {
  isErrorHandlerShown = false;
  showBadgeForError$: Observable<boolean>;
  showBadgeForFlow$: Observable<boolean>;
  private ngOnDestroy$ = SingleEmissionSubject.create();

  constructor(private store: Store<FlowState>) {
    this.store
      .pipe(select(FlowSelectors.selectErrorPanelStatus), takeUntil(this.ngOnDestroy$))
      .subscribe(isErrorPanelOpen => (this.isErrorHandlerShown = isErrorPanelOpen));
    this.showBadgeForFlow$ = this.store.pipe(select(getPrimaryFlowHasExecutionErrors));
    this.showBadgeForError$ = this.store.pipe(select(getErrorFlowHasExecutionErrors));
  }

  selectPrimaryFlow() {
    this.store.dispatch(new FlowActions.ErrorPanelStatusChange({ isOpen: false }));
  }

  selectErrorHandler() {
    this.store.dispatch(new FlowActions.ErrorPanelStatusChange({ isOpen: true }));
  }
}
