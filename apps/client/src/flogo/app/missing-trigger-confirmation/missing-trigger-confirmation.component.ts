import { Component, HostBinding, Inject } from '@angular/core';
import { modalAnimate, ModalControl, MODAL_TOKEN } from '@flogo-web/lib-client/modal';

export interface ConfirmationParams {
  type: 'export' | 'build';
}

export interface ConfirmationResult {
  confirm: boolean;
  dontShowAgain: boolean;
}

@Component({
  selector: 'flogo-missing-trigger-confirmation',
  templateUrl: './missing-trigger-confirmation.component.html',
  styleUrls: ['./missing-trigger-confirmation.component.less'],
  animations: modalAnimate,
})
export class MissingTriggerConfirmationComponent {
  @HostBinding('@modalAnimate') public modalAnimate = true;
  public dontShowAgain = false;
  public readonly i18nMessage: string;
  public readonly i18nConfirmBtn: string;

  constructor(
    public control: ModalControl,
    @Inject(MODAL_TOKEN) { type }: ConfirmationParams
  ) {
    const msgType = type === 'export' ? 'EXPORT' : 'BUILD';
    this.i18nMessage = `APP.MISSING_TRIGGER.MESSAGE-${msgType}`;
    this.i18nConfirmBtn = `APP.MISSING_TRIGGER.CONFIRM-${msgType}`;
  }

  confirm() {
    const result: ConfirmationResult = {
      confirm: true,
      dontShowAgain: this.dontShowAgain,
    };
    this.control.close(result);
  }

  cancel() {
    this.control.close(null);
  }
}
