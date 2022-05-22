import { Directive, HostListener, EventEmitter, Output } from '@angular/core';

@Directive({
  selector: '[fgOnEscape]',
})
export class ActionOnEscapeDirective {
  @Output() fgOnEscape = new EventEmitter<KeyboardEvent>();

  @HostListener('document:keydown.escape')
  onEscape() {
    this.fgOnEscape.emit();
  }
}
