import {
  Component,
  HostBinding,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';

@Component({
  selector: 'flogo-context-panel-header-toggler',
  templateUrl: './header-toggler.component.html',
  styleUrls: ['./header-toggler.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderTogglerComponent {
  @Input() isOpen: boolean;
  @Input() label: string;
  @Output() open = new EventEmitter();
  @Output() close = new EventEmitter();

  @HostBinding('attr.role')
  get role() {
    return !this.isOpen ? 'button' : null;
  }

  @HostListener('click')
  onOpen() {
    this.open.emit();
  }

  onClose(event) {
    if (this.isOpen) {
      event.stopPropagation();
      this.close.emit();
    }
  }
}
