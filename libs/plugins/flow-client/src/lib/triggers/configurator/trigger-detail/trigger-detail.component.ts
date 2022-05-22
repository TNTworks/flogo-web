import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, switchMap, take, takeUntil } from 'rxjs/operators';

import { SingleEmissionSubject } from '@flogo-web/lib-client/core';
import { MapperController } from '@flogo-web/lib-client/mapper';

import {
  TriggerConfigureSelectors,
  TriggerConfigureActions,
} from '../../../core/state/triggers-configure';
import { FlowState } from '../../../core/state';
import { TriggerConfigureTabType, TriggerConfigureTab } from '../../../core/interfaces';
import { CurrentTriggerState, TriggerInformation } from '../interfaces';
import { ConfiguratorService } from '../services/configurator.service';
import { ConfigureDetailsService } from './details.service';

type MapperSubscriberFn = (
  controller: MapperController,
  groupType: TriggerConfigureTabType
) => void;

const isFieldValid = (form: FormGroup, controlName: string) =>
  !form.contains(controlName) || form.get(controlName).valid;

@Component({
  selector: 'flogo-flow-triggers-configurator-detail',
  styleUrls: ['trigger-detail.component.less'],
  templateUrl: 'trigger-detail.component.html',
  providers: [],
})
export class TriggerDetailComponent implements OnInit, OnDestroy {
  TAB_TYPES = TriggerConfigureTabType;

  selectedTriggerId: string;

  isSaving$: Observable<boolean>;
  overallStatus$: Observable<{ isDirty: boolean; isValid: boolean }>;
  tabs$: Observable<TriggerConfigureTab[]>;
  currentTabType: TriggerConfigureTabType;

  flowInputMapperController?: MapperController;
  replyMapperController?: MapperController;
  settingsForm: FormGroup;
  settingsTriggerInformation: TriggerInformation;
  appProperties?: string[];

  private previousState: CurrentTriggerState;
  private getCurrentTriggerState: Observable<CurrentTriggerState>;
  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(
    private store: Store<FlowState>,
    private detailsService: ConfigureDetailsService,
    private configuratorService: ConfiguratorService
  ) {}

  ngOnInit() {
    this.overallStatus$ = this.store.pipe(
      TriggerConfigureSelectors.getCurrentTriggerOverallStatus
    );

    this.tabs$ = this.store.pipe(TriggerConfigureSelectors.getCurrentTabs);
    this.store
      .pipe(
        select(TriggerConfigureSelectors.getCurrentTabType),
        takeUntil(this.ngDestroy$)
      )
      .subscribe(currentTabType => {
        this.currentTabType = currentTabType;
      });

    this.isSaving$ = this.store.pipe(TriggerConfigureSelectors.getCurrentTriggerIsSaving);
    this.getCurrentTriggerState = this.store.pipe(
      select(TriggerConfigureSelectors.getConfigureState),
      take(1)
    );
    this.store
      .pipe(
        select(TriggerConfigureSelectors.selectCurrentTriggerId),
        filter(currentTriggerId => !!currentTriggerId),
        switchMap(() => this.getCurrentTriggerState),
        takeUntil(this.ngDestroy$)
      )
      .subscribe(state => {
        this.previousState = state;
        this.reconfigure(state);
      });
  }

  ngOnDestroy() {
    this.isSaving$ = null;
    this.ngDestroy$.emitAndComplete();
  }

  save() {
    const currentTriggerId = this.selectedTriggerId;
    const isUpdateStillApplicable = () =>
      this.selectedTriggerId !== currentTriggerId || !this.ngDestroy$.closed;
    this.configuratorService
      .save()
      .pipe(
        filter(() => isUpdateStillApplicable()),
        switchMap(() => this.getCurrentTriggerState)
      )
      .subscribe(triggerState => {
        this.previousState = triggerState;
        this.settingsForm.reset(this.settingsForm.getRawValue());
        this.updateSettingsStatus({
          // TODO: replace manual valid check when async validation bug is fixed in ng forms -> github.com/angular/angular/issues/20424
          isValid:
            isFieldValid(this.settingsForm, 'triggerSettings') &&
            isFieldValid(this.settingsForm, 'handlerSettings'),
          isDirty: this.settingsForm.dirty,
          isPending: false,
        });

        if (this.flowInputMapperController) {
          this.flowInputMapperController.resetStatus();
        }
        if (this.replyMapperController) {
          this.replyMapperController.resetStatus();
        }
      });
  }

  onTabSelected(tab: TriggerConfigureTab) {
    if (tab.type !== this.currentTabType) {
      this.store.dispatch(new TriggerConfigureActions.SelectTab(tab.type));
    }
  }

  updateSettingsStatus(settingsStatus: {
    isValid: boolean;
    isDirty: boolean;
    isPending?: boolean;
  }) {
    this.updateTabState(TriggerConfigureTabType.Settings, settingsStatus);
  }

  discardChanges() {
    if (this.previousState) {
      this.reconfigure(this.previousState);
    }
  }

  private reconfigure(state: CurrentTriggerState) {
    this.selectedTriggerId = state.trigger.id;
    const {
      settings,
      flowInputMapper,
      replyMapper,
      triggerInformation,
    } = this.detailsService.build(state);
    if (this.settingsForm) {
      this.settingsForm.enable();
    }
    this.settingsForm = settings;
    this.settingsTriggerInformation = triggerInformation;
    this.updateSettingsStatus({
      // TODO: replace manual valid check when async validation bug is fixed in ng forms -> https://github.com/angular/angular/issues/20424
      isValid:
        isFieldValid(this.settingsForm, 'triggerSettings') &&
        isFieldValid(this.settingsForm, 'handlerSettings'),
      isDirty: this.settingsForm.dirty,
      isPending: false,
    });

    const subscribeToUpdates = this.createMapperStatusUpdateSubscriber();

    this.flowInputMapperController = flowInputMapper;
    this.reconfigureMapperController(
      this.flowInputMapperController,
      TriggerConfigureTabType.FlowInputMappings,
      subscribeToUpdates
    );

    this.replyMapperController = replyMapper;
    this.reconfigureMapperController(
      this.replyMapperController,
      TriggerConfigureTabType.FlowOutputMappings,
      subscribeToUpdates
    );

    this.appProperties = state.appProperties
      ? state.appProperties
          .map(prop => (prop && prop.name ? `$property[${prop.name}]` : null))
          .filter(Boolean)
      : null;

    this.configuratorService.setParams({
      settings: this.settingsForm,
      flowInputMapper: this.flowInputMapperController,
      replyMapper: this.replyMapperController,
    });
  }

  private reconfigureMapperController(
    controller: MapperController,
    groupType: TriggerConfigureTabType,
    subscribeToUpdates: MapperSubscriberFn
  ) {
    if (controller) {
      subscribeToUpdates(controller, groupType);
      this.updateTabState(groupType, { isEnabled: true });
    } else {
      this.updateTabState(groupType, {
        isDirty: false,
        isValid: true,
        isEnabled: false,
        isPending: false,
      });
    }
  }

  private updateTabState(groupType: TriggerConfigureTabType, newStatus) {
    this.store.dispatch(
      new TriggerConfigureActions.ConfigureStatusChanged({
        triggerId: this.selectedTriggerId,
        groupType,
        newStatus,
      })
    );
  }

  private createMapperStatusUpdateSubscriber(): MapperSubscriberFn {
    return (controller: MapperController, groupType: TriggerConfigureTabType) => {
      controller.status$
        .pipe(takeUntil(this.ngDestroy$))
        .subscribe(status => this.updateTabState(groupType, status));
    };
  }
}
