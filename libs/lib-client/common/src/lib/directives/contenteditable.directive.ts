import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChange,
  Renderer2,
  HostBinding,
  Inject,
  OnDestroy,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

const isEmptyValue = (value): boolean =>
  value === undefined || value === null || value.trim().length === 0;

@Directive({
  selector: '[fgContentEditable]',
})
export class ContenteditableDirective implements OnInit, OnChanges, OnDestroy {
  @Input() fgContentEditable: string;
  @Input() placeholder: string;
  @Input() allowNewLines = false;
  @Output() fgContentEditableChange = new EventEmitter();
  @HostBinding('style') style: SafeStyle;
  @HostBinding('style.borderColor') borderColor = 'transparent';
  @HostBinding('style.color') color;
  @HostBinding('style.overflow') overflow;
  @HostBinding('style.textOverflow') textOverflow;

  private placeholderEl: any = null;
  private colorFlag: boolean;
  private hasFocus = false;
  private isHovered = false;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private domSanitizer: DomSanitizer,
    @Inject(DOCUMENT) private document
  ) {}

  ngOnChanges(changes: { fgContentEditable?: SimpleChange }) {
    if (!changes.fgContentEditable || changes.fgContentEditable.isFirstChange()) {
      return;
    }
    this.setContent(this.fgContentEditable);
    this.checkPlaceholder();
  }

  ngOnInit() {
    if (this.fgContentEditable !== undefined) {
      this.setContent(this.fgContentEditable);
    }
    this.renderer.setAttribute(this.elementRef.nativeElement, 'contenteditable', 'true');

    const computedStyles = getComputedStyle(this.elementRef.nativeElement);
    const padding = `4px`;
    const height = parseInt(computedStyles.lineHeight, 10) - 2;
    this.style = this.domSanitizer.bypassSecurityTrustStyle(`
      padding-right: ${padding};
      margin-left: -${padding};
      padding-left: ${padding};
      border-radius: ${padding};
      outline: none;
      line-height: ${height}px;
      min-height: ${height}px;
      border: 1px solid transparent;
    `);

    this.checkPlaceholder();

    const origColor = computedStyles.color;
    // todo: why this value?
    if (origColor === 'rgb(255, 255, 255)') {
      this.colorFlag = true;
    }
  }

  ngOnDestroy() {
    this.placeholderEl = null;
  }

  @HostListener('mouseenter')
  onMouseEnter() {
    if (this.document.activeElement === this.elementRef.nativeElement) {
      return;
    }
    this.isHovered = true;
    this.updateStyles();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (this.document.activeElement === this.elementRef.nativeElement) {
      return;
    }
    this.isHovered = false;
    this.updateStyles();
  }

  @HostListener('focus')
  onFocus() {
    this.hasFocus = true;
    this.removePlaceholder();
    this.updateStyles();
  }

  @HostListener('blur')
  onBlur() {
    this.hasFocus = false;
    this.isHovered = false;
    const text = this.elementRef.nativeElement.textContent;
    this.renderer.setProperty(this.elementRef.nativeElement, 'scrollLeft', '0');
    if (text !== this.fgContentEditable) {
      this.fgContentEditableChange.emit(text);
      this.setContent(this.fgContentEditable);
    }
    this.updateStyles();
    this.checkPlaceholder();
  }

  @HostListener('keydown.esc')
  onCancel() {
    this.setContent(this.fgContentEditable);
    this.elementRef.nativeElement.blur();
  }

  @HostListener('keydown.enter')
  onEnter() {
    if (!this.allowNewLines) {
      this.elementRef.nativeElement.blur();
    }
  }

  private setContent(value) {
    value = !isEmptyValue(value) ? value : '';
    this.renderer.setProperty(this.elementRef.nativeElement, 'textContent', value);
  }

  private checkPlaceholder() {
    const text = this.elementRef.nativeElement.textContent;
    if (text === '') {
      this.appendPlaceholder();
    } else {
      this.removePlaceholder();
    }
  }

  private appendPlaceholder() {
    if (this.placeholderEl) {
      return;
    }
    Array.from(this.elementRef.nativeElement.children).forEach(child =>
      this.renderer.removeChild(this.elementRef.nativeElement, child)
    );
    const placeholderText = this.renderer.createText(this.placeholder);
    this.placeholderEl = this.renderer.createElement('span');
    this.renderer.setStyle(this.placeholderEl, 'pointer-events', 'none');
    this.renderer.appendChild(this.placeholderEl, placeholderText);
    this.renderer.appendChild(this.elementRef.nativeElement, this.placeholderEl);
  }

  private removePlaceholder() {
    if (
      this.placeholderEl &&
      this.renderer.parentNode(this.placeholderEl) === this.elementRef.nativeElement
    ) {
      this.renderer.removeChild(this.elementRef.nativeElement, this.placeholderEl);
      this.placeholderEl = null;
    }
  }

  private updateStyles() {
    this.checkColor();
    this.checkBorderColor();
    this.checkOverflow();
    this.checkTextOverflow();
  }

  private checkColor() {
    this.color = null;
    if (!this.colorFlag) {
      return;
    }
    if (this.hasFocus) {
      this.color = 'rgb(102, 102, 102)';
    } else if (this.isHovered) {
      this.color = '#666';
    }
  }

  private checkOverflow() {
    this.overflow = this.hasFocus ? 'auto' : 'hidden';
  }

  private checkTextOverflow() {
    this.textOverflow = this.hasFocus ? 'clip' : 'ellipsis';
  }

  private checkBorderColor() {
    let color = 'transparent';
    if (this.hasFocus) {
      color = '#0082d5';
    } else if (this.isHovered) {
      color = '#ccc';
    }
    return (this.borderColor = color);
  }
}
