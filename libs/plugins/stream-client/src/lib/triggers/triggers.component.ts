import { fromPairs, isArray, uniq } from 'lodash';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  HandlersService,
  SingleEmissionSubject,
  TriggersService,
  RenderableTrigger,
  Dictionary,
  Trigger,
} from '@flogo-web/lib-client/core';
import { select, Store } from '@ngrx/store';
import {
  StreamStoreState as AppState,
  TriggerActions,
  TRIGGER_MENU_OPERATION,
  MicroServiceModelConverter,
  selectSchemas,
} from '../core';
import { filter, switchMap, takeUntil } from 'rxjs/operators';
import { getTriggersState } from '../core/state/triggers/triggers.selectors';
import { ModalService, ModalControl } from '@flogo-web/lib-client/modal';
import {
  ConfirmationModalService,
  ConfirmationResult,
} from '@flogo-web/lib-client/confirmation';
import { LanguageService } from '@flogo-web/lib-client/language';
import { TriggerMenuSelectionEvent } from './trigger-block/models';
import { ContributionSchema, TriggerSchema } from '@flogo-web/core';
import { TriggerConfigureActions } from '../core/state/triggers-configure';
import {
  TriggerSelectorComponent,
  TriggerSelectorResult,
} from '@flogo-web/lib-client/trigger-shared';

function settingsToObject(
  settings: { name: string; value?: any }[],
  getValue: (s: { value?: any }) => any = s => s.value
) {
  return isArray(settings) ? fromPairs(settings.map(s => [s.name, getValue(s)])) : {};
}

@Component({
  selector: 'flogo-stream-triggers',
  templateUrl: 'triggers.component.html',
  styleUrls: ['triggers.component.less'],
})
export class FlogoStreamTriggersPanelComponent implements OnInit, OnDestroy {
  @Input() iconIndex: { [itemId: string]: string };

  appId: string;
  actionId: string;
  triggersList: RenderableTrigger[] = [];
  control: ModalControl;
  private ngDestroy$ = SingleEmissionSubject.create();
  constructor(
    private store: Store<AppState>,
    private modalService: ModalService,
    private restAPITriggersService: TriggersService,
    private _restAPIHandlerService: HandlersService,
    private confirmationService: ConfirmationModalService,
    private translate: LanguageService,
    private converterService: MicroServiceModelConverter
  ) {}

  ngOnInit() {
    this.store
      .pipe(select(getTriggersState), takeUntil(this.ngDestroy$))
      .subscribe(triggerState => {
        this.triggersList = triggerState.triggers;
        this.actionId = triggerState.actionId;
        this.appId = triggerState.appId;
      });
  }

  ngOnDestroy() {
    this.ngDestroy$.emitAndComplete();
  }

  trackTriggerBy(index: number, trigger: RenderableTrigger) {
    return trigger.id;
  }

  openAddTriggerModal() {
    const data = { appId: this.appId };
    this.modalService
      .openModal(TriggerSelectorComponent, data)
      .result.subscribe((result: TriggerSelectorResult) => {
        if (result) {
          this.addTriggerToAction(result);
        }
      });
  }

  addTriggerToAction(data: TriggerSelectorResult) {
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
      const appId = this.appId;
      const { title, ref, description } = data.triggerSchema;
      const newTrigger: Partial<Trigger> = {
        name: title,
        ref,
        description,
        // todo: why are we not using triggerSchema.settins' default values?
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
      .subscribe(() => {
        this.store.dispatch(new TriggerActions.RemoveHandler(triggerId));
      });
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
