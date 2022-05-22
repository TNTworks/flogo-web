import { Injectable } from '@angular/core';
import { ConfirmationService } from '../confirmation.service';
import {
  CONFIRMATION_MODAL_TOKEN,
  ConfirmationModal,
  ConfirmationModalComponent,
} from './confirmation-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationModalService {
  constructor(public confirmationService: ConfirmationService) {}

  openModal({ title, textMessage }) {
    const data = new WeakMap<any, any>();
    data.set(CONFIRMATION_MODAL_TOKEN, {
      title,
      textMessage,
    } as ConfirmationModal);
    return this.confirmationService.openModal(ConfirmationModalComponent, data);
  }
}
