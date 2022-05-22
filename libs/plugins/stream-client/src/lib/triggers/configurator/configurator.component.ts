import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import {
  ConfirmationControl,
  ConfirmationResult,
  ConfirmationService,
} from '@flogo-web/lib-client/confirmation';
import {
  ConfirmationComponent,
  TRIGGER_STATUS_TOKEN,
  TriggerStatus,
} from '@flogo-web/lib-client/trigger-shared';

import { TriggerConfigureSelectors } from '../../core/state/triggers-configure';
import * as TriggerConfigureActions from '../../core/state/triggers-configure/trigger-configure.actions';
import { FlogoStreamState } from '../../core/state';

import { configuratorAnimations } from './configurator.animations';
import { ConfiguratorService as TriggerConfiguratorService } from './services/configurator.service';

@Component({
  selector: 'flogo-stream-triggers-configuration',
  templateUrl: 'configurator.component.html',
  styleUrls: ['configurator.component.less'],
  animations: configuratorAnimations,
  providers: [ConfirmationService],
})
export class ConfiguratorComponent implements OnInit, OnDestroy {
  @Input() iconIndex: { [itemId: string]: string };

  isConfiguratorInitialized$: Observable<boolean>;
  triggerStatuses$: Observable<TriggerStatus[]>;
  currentTriggerDetailStatus: TriggerStatus;
  selectedTriggerId: string;
  isOpen: boolean;
  confirmationModalRef: ConfirmationControl;

  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(
    private triggerConfiguratorService: TriggerConfiguratorService,
    private confirmationService: ConfirmationService,
    private store: Store<FlogoStreamState>
  ) {}

  ngOnInit() {
    this.isConfiguratorInitialized$ = this.store.pipe(
      select(TriggerConfigureSelectors.getHasTriggersConfigure)
    );
    const triggerStatuses$ = this.store.pipe(
      select(TriggerConfigureSelectors.getTriggerStatuses)
    );
    this.triggerStatuses$ = this.observeWhileConfiguratorIsActive(triggerStatuses$, []);

    this.isConfiguratorInitialized$
      .pipe(takeUntil(this.ngDestroy$))
      .subscribe(isConfigInitialized => {
        this.isOpen = isConfigInitialized;
        if (this.isOpen) {
          this.triggerConfiguratorService.clear();
        }
      });

    this.store
      .pipe(
        TriggerConfigureSelectors.getCurrentTriggerOverallStatus,
        takeUntil(this.ngDestroy$)
      )
      .subscribe(status => {
        this.currentTriggerDetailStatus = status;
      });

    const currentTriggerId$ = this.store.pipe(
      select(TriggerConfigureSelectors.selectCurrentTriggerId)
    );
    this.observeWhileConfiguratorIsActive(currentTriggerId$, null).subscribe(
      currentTriggerId => {
        this.selectedTriggerId = currentTriggerId;
      }
    );
  }

  changeTriggerSelection(triggerId: string) {
    if (this.isConfirmationModalOpen()) {
      return;
    }
    const switchTrigger = () => {
      this.disposeConfirmationModalRef();
      this.store.dispatch(new TriggerConfigureActions.SelectTrigger(triggerId));
    };
    this.checkForContextSwitchConfirmation((result?: ConfirmationResult) => {
      if (!result || result === ConfirmationResult.Discard) {
        switchTrigger();
      } else if (result === ConfirmationResult.Cancel) {
        this.disposeConfirmationModalRef();
      } else if (result === ConfirmationResult.Confirm) {
        this.triggerConfiguratorService.save().subscribe(() => {});
        switchTrigger();
      }
    });
  }

  ngOnDestroy() {
    this.triggerConfiguratorService.clear();
    this.ngDestroy$.emitAndComplete();
  }

  onCloseOrDismiss() {
    if (this.isConfirmationModalOpen()) {
      return;
    }
    const close = () => {
      this.disposeConfirmationModalRef();
      this.store.dispatch(new TriggerConfigureActions.CloseConfigure());
    };
    this.checkForContextSwitchConfirmation((result?: ConfirmationResult) => {
      if (!result || result === ConfirmationResult.Discard) {
        close();
      } else if (result === ConfirmationResult.Cancel) {
        this.disposeConfirmationModalRef();
      } else if (result === ConfirmationResult.Confirm) {
        this.triggerConfiguratorService.save().subscribe(() => {});
        close();
      }
    });
  }

  private checkForContextSwitchConfirmation(
    onResult: (result?: ConfirmationResult | null) => void
  ) {
    const status = this.currentTriggerDetailStatus;
    if (!status || !status.isDirty) {
      return onResult();
    }
    const injectionTokens = new WeakMap();
    injectionTokens.set(TRIGGER_STATUS_TOKEN, status);
    this.confirmationModalRef = this.confirmationService.openModal(
      ConfirmationComponent,
      injectionTokens
    );
    this.confirmationModalRef.result.subscribe(onResult);
  }

  private observeWhileConfiguratorIsActive<T>(
    observable$: Observable<T>,
    valueWhenNotInitialized: any
  ) {
    return this.isConfiguratorInitialized$.pipe(
      switchMap(isInitialized =>
        isInitialized ? observable$ : of(valueWhenNotInitialized)
      ),
      takeUntil(this.ngDestroy$)
    );
  }

  private isConfirmationModalOpen() {
    return this.confirmationModalRef;
  }

  private disposeConfirmationModalRef() {
    this.confirmationModalRef = null;
  }
}
