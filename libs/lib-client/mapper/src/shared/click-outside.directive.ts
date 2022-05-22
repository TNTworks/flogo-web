import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[fgMapperClickOutside]',
})
export class ClickOutsideDirective {
  // tslint:disable-next-line:no-output-rename
  @Output('fgMapperClickOutside')
  public clickOutside = new EventEmitter<MouseEvent>();

  constructor(private _elementRef: ElementRef) {}

  @HostListener('document:click', ['$event', '$event.path', '$event.target'])
  public onClick(
    event: MouseEvent,
    targetPath: Element[],
    targetElement: HTMLElement
  ): void {
    if (!targetElement) {
      return;
    }

    let clickedOutside = true;
    if (targetPath) {
      clickedOutside = !targetPath.find(e => e === this._elementRef.nativeElement);
    } else {
      clickedOutside = !this._elementRef.nativeElement.contains(targetElement);
    }

    if (clickedOutside) {
      this.clickOutside.emit(event);
    }
  }
}
