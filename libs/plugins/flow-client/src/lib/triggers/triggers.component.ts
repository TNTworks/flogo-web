import { uniq, fromPairs, isArray } from 'lodash';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { filter, takeUntil, switchMap } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';

import { ContributionSchema, TriggerSchema } from '@flogo-web/core';
import {
  Dictionary,
  SingleEmissionSubject,
  TriggersService,
  HandlersService,
} from '@flogo-web/lib-client/core';
import {
  ConfirmationModalService,
  ConfirmationResult,
} from '@flogo-web/lib-client/confirmation';
import { LanguageService } from '@flogo-web/lib-client/language';

import {
  Trigger,
  FlowMetadata,
  MicroServiceModelConverter,
  TRIGGER_MENU_OPERATION,
} from '../core';
import { AppState } from '../core/state/app.state';
import { getTriggersState } from '../core/state/triggers/triggers.selectors';
import * as TriggerActions from '../core/state/triggers/triggers.actions';
import * as TriggerConfigureActions from '../core/state/triggers-configure/trigger-configure.actions';
import { TriggerMenuSelectionEvent } from './trigger-block/models';
import { RenderableTrigger } from './interfaces/renderable-trigger';
import { ModalService, ModalControl } from '@flogo-web/lib-client/modal';
import {
  TriggerSelectorComponent,
  TriggerSelectorResult,
} from '@flogo-web/lib-client/trigger-shared';
import { IconProvider } from '@flogo-web/lib-client/diagram';
import { selectSchemas } from '../core/state';

function settingsToObject(
  settings: { name: string; value?: any }[],
  getValue: (s: { value?: any }) => any = s => s.value
) {
  return isArray(settings) ? fromPairs(settings.map(s => [s.name, getValue(s)])) : {};
}

@Component({
  selector: 'flogo-flow-triggers',
  templateUrl: 'triggers.component.html',
  styleUrls: ['triggers.component.less'],
})
export class FlogoFlowTriggersPanelComponent implements OnInit, OnDestroy {
  @Input() iconProvider?: IconProvider;

  actionId: string;
  appDetails: {
    appId: string;
    metadata?: FlowMetadata;
  };
  triggersList: RenderableTrigger[] = [];
  control: ModalControl;

  private ngDestroy$ = SingleEmissionSubject.create();

  constructor(
    private restAPITriggersService: TriggersService,
    private _restAPIHandlerService: HandlersService,
    private converterService: MicroServiceModelConverter,
    private translate: LanguageService,
    private store: Store<AppState>,
    private confirmationService: ConfirmationModalService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.store
      .pipe(select(getTriggersState), takeUntil(this.ngDestroy$))
      .subscribe(triggerState => {
        this.actionId = triggerState.actionId;
        this.triggersList = triggerState.triggers;
        // todo: possibly flatten this structure out but some sub components depend on it right now
        this.appDetails = {
          appId: triggerState.appId,
          metadata: triggerState.flowMetadata,
        };
      });
  }

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }

  trackTriggerBy(index: number, trigger: RenderableTrigger) {
    return trigger.id;
  }

  openAddTriggerModal() {
    const data = { appId: this.appDetails.appId };
    this.modalService
      .openModal(TriggerSelectorComponent, data)
      .result.subscribe((result: TriggerSelectorResult) => {
        if (result) {
          this.addTriggerToAction(result);
        }
      });
  }

  addTriggerToAction(data) {
    this.persistNewTriggerAndHandler(data)
      .then(triggerId => this.restAPITriggersService.getTrigger(triggerId))
      .then(trigger => {
        const handler = trigger.handlers.find(h => h.actionId === this.actionId);
        this.store.dispatch(new TriggerActions.AddTrigger({ trigger, handler }));
      });
  }

  private persistNewTriggerAndHandler(data: TriggerSelectorResult) {
    let registerTrigger;
    if (data.installType === 'installed') {
      const appId = this.appDetails.appId;
      const { title, ref, description } = data.triggerSchema;
      const newTrigger: Partial<Trigger> = {
        name: title,
        ref,
        description,
        // todo: why are we not using triggerSchema.settings' default values?
        settings: settingsToObject(data.triggerSchema.settings, _ => null),
      };

      registerTrigger = this.restAPITriggersService
        .createTrigger(appId, newTrigger)
        .then(triggerResult => triggerResult.id);
    } else {
      registerTrigger = Promise.resolve(data.trigger.id);
    }
    const triggerSchema = data.triggerSchema;
    const handlerSettings = settingsToObject(
      triggerSchema.handler && triggerSchema.handler.settings
    );
    const outputs = settingsToObject(data.triggerSchema.outputs);
    return registerTrigger.then(triggerId => {
      return this._restAPIHandlerService
        .updateHandler(triggerId, this.actionId, { settings: handlerSettings, outputs })
        .then(() => triggerId);
    });
  }

  private openTriggerMapper(selectedTrigger: Trigger) {
    let allContribSchemas: Dictionary<ContributionSchema>;
    this.store
      .pipe(select(selectSchemas), takeUntil(this.ngDestroy$))
      .subscribe(schemas => {
        allContribSchemas = schemas;
      });

    const refs = uniq(this.triggersList.map(trigger => trigger.ref));
    const triggerSchemas = refs.reduce((schemas, ref) => {
      if (this.converterService.validateTriggerSchema({ ref })) {
        const triggerSchema = <TriggerSchema>allContribSchemas[ref];
        schemas[ref] = this.converterService.normalizeTriggerSchema(triggerSchema);
      }
      return schemas;
    }, {});
    this.store.dispatch(
      new TriggerConfigureActions.OpenConfigureWithSelection({
        triggerId: selectedTrigger.id,
        triggerSchemas,
      })
    );
  }

  private deleteHandlerForTrigger(triggerId) {
    const titleKey = 'PLUGIN-FLOW:TRIGGERS:DELETE-CONFIRMATION-TITLE';
    const messageKey = 'PLUGIN-FLOW:TRIGGERS:DELETE-CONFIRMATION-MESSAGE';
    this.translate
      .get([titleKey, messageKey])
      .pipe(
        switchMap(translation => {
          return this.confirmationService.openModal({
            title: translation[titleKey],
            textMessage: translation[messageKey],
          }).result;
        }),
        filter(result => result === ConfirmationResult.Confirm),
        switchMap(() =>
          this._restAPIHandlerService.deleteHandler(this.actionId, triggerId)
        )
      )
      .subscribe(() => this.store.dispatch(new TriggerActions.RemoveHandler(triggerId)));
  }

  handleMenuSelection(event: TriggerMenuSelectionEvent) {
    switch (event.operation) {
      case TRIGGER_MENU_OPERATION.SHOW_SETTINGS:
        this.openTriggerMapper(event.trigger);
        break;
      case TRIGGER_MENU_OPERATION.DELETE:
        this.deleteHandlerForTrigger(event.trigger.id);
        break;
      default:
        console.warn(`[TRIGGER MENU][${event.operation}] unhandled menu action.`);
        break;
    }
  }
}
