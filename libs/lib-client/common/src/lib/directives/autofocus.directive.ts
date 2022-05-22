import { AfterContentInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[fgAutofocus]',
})
export class AutofocusDirective implements AfterContentInit {
  @Input()
  shouldAutofocus = true;

  constructor(private _el: ElementRef) {}

  ngAfterContentInit() {
    if (this.shouldAutofocus && this._el && this._el.nativeElement) {
      this._el.nativeElement.focus();
    }
  }
}
