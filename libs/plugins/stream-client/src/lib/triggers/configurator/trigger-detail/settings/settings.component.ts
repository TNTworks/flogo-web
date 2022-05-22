import { isEqual } from 'lodash';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ElementRef,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import {
  ConfirmationService,
  ConfirmationResult,
} from '@flogo-web/lib-client/confirmation';

import { TriggerInformation } from '../../interfaces';
import {
  ConfirmEditionComponent,
  EDITION_DATA_TOKEN,
  EditionData,
} from './confirm-edition/confirm-edition.component';

const COMMON_FIELDS_TO_ENABLE = ['name', 'description', 'triggerSettings'];

@Component({
  selector: 'flogo-stream-triggers-configuration-settings',
  templateUrl: 'settings.component.html',
  styleUrls: ['./shared/form-common-styles.less', 'settings.component.less'],
})
export class ConfigureSettingsComponent implements OnChanges, OnDestroy {
  @Input() settingsForm: FormGroup;
  @Input() triggerInformation: TriggerInformation;
  @Input() appProperties?: string[];
  @Output() statusChanges = new EventEmitter();
  triggerSettings: string[] | null;
  handlerSettings: string[] | null;

  private previousState;
  private valueChangeSubscription: Subscription;

  constructor(private confirmationService: ConfirmationService) {}

  ngOnChanges() {
    this.triggerSettings = this.settingsForm.controls.triggerSettings
      ? Object.keys((<FormGroup>this.settingsForm.controls.triggerSettings).controls)
      : null;
    this.handlerSettings = this.settingsForm.controls.handlerSettings
      ? Object.keys((<FormGroup>this.settingsForm.controls.handlerSettings).controls)
      : null;
    this.unsubscribePrevious();
    this.previousState = null;
    this.valueChangeSubscription = this.settingsForm.statusChanges.subscribe(() => {
      const settingsStatus = this.getSettingsFormStatus();
      if (!isEqual(this.previousState, settingsStatus)) {
        this.previousState = settingsStatus;
        this.statusChanges.emit(settingsStatus);
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribePrevious();
  }

  onEnableNameOrDescription(nativeElement) {
    this.onEnableSettings(new ElementRef(nativeElement));
  }

  onEnableSettings(ref: ElementRef) {
    const data = new WeakMap<any, any>();
    data.set(EDITION_DATA_TOKEN, {
      streamCount: this.triggerInformation.trigger.handlersCount,
    } as EditionData);
    this.confirmationService
      .openPopover(ref, ConfirmEditionComponent, data)
      .result.subscribe(result => {
        if (result === ConfirmationResult.Confirm) {
          this.enableAllSettings();
        }
      });
  }

  enableAllSettings() {
    COMMON_FIELDS_TO_ENABLE.forEach(prop => {
      const propInSettingsForm = this.settingsForm.get(prop);
      if (propInSettingsForm) {
        propInSettingsForm.enable();
      }
    });
  }

  private unsubscribePrevious() {
    if (this.valueChangeSubscription && !this.valueChangeSubscription.closed) {
      this.valueChangeSubscription.unsubscribe();
      this.valueChangeSubscription = null;
    }
  }

  getSettingsFormStatus() {
    return {
      isPending: this.settingsForm.pending,
      isValid: this.settingsForm.valid,
      isDirty: this.settingsForm.dirty,
    };
  }
}
