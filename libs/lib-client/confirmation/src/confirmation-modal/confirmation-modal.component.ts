import { Component, HostListener, Inject, InjectionToken } from '@angular/core';
import { ConfirmationControl } from '../confirmation-control';
import { ConfirmationContent } from '../confirmation-content';
import { animate, style, transition, trigger } from '@angular/animations';

export const CONFIRMATION_MODAL_TOKEN = new InjectionToken(
  'flogo/confirmation/flogo-confirmation-modal'
);

export interface ConfirmationModal {
  title?: string;
  textMessage?: string;
}

@Component({
  selector: 'flogo-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.less'],
  animations: [
    trigger('dialog', [
      transition('void => *', [
        style({ transform: 'translateY(-100%)', opacity: 0 }),
        animate('250ms ease-in'),
      ]),
      transition('* => void', [
        animate('250ms ease-in', style({ transform: 'translateY(-100%)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class ConfirmationModalComponent implements ConfirmationContent {
  constructor(
    @Inject(CONFIRMATION_MODAL_TOKEN) public data: ConfirmationModal,
    public control: ConfirmationControl
  ) {}

  @HostListener('document:keydown.escape') closeModal() {
    this.control.cancel();
  }
}
