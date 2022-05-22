import {
  Component,
  HostBinding,
  HostListener,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { modalAnimate } from '../../modal-animation';

export type ModalSize = 'small' | 'large' | 'fullscreen';

/**
 * Modal component.
 *
 * Provides standard layout and styles for Flogo Modals.
 *
 */
@Component({
  selector: 'flogo-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.less'],
  animations: modalAnimate,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  /**
   * Control the size and layout of the modal
   * @see ModalSize options: small, large, fullscreen
   */
  @HostBinding('class') @Input() size: ModalSize = 'large';
  /**
   * Control the visibility of the close button
   * @default true
   */
  @Input() showClose = true;
  /**
   * Event emitted when user click on close button
   */
  @Output() close = new EventEmitter<void>();

  @HostBinding('@modalAnimate') animate = true;

  /**
   * close the modal on escape keypress
   */
  @HostListener('document:keydown.escape') closeModal() {
    this.close.emit();
  }
}
