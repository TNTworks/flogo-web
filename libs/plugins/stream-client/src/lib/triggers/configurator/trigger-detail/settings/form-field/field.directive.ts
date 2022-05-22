import {
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValueType } from '@flogo-web/core';
import { SettingValue } from '../../settings-value';
import { parseValue } from '../parse-value';

export const FIELD_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => FieldValueAccesorDirective),
  multi: true,
};

@Directive({
  selector: 'input[fgTriggerSettingsField]',
  providers: [FIELD_VALUE_ACCESSOR],
})
export class FieldValueAccesorDirective implements ControlValueAccessor {
  // tslint:disable-next-line:no-input-rename - simplifying internal api
  @Input('fgTriggerSettingsField') type: ValueType;

  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {}

  update(value: string) {
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', value);
    this.handleInput(value);
  }

  writeValue(value: SettingValue): void {
    const normalizedValue =
      value == null || value.viewValue == null ? '' : value.viewValue;
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', normalizedValue);
  }

  @HostListener('blur')
  handleBlur() {
    if (this.onTouched) {
      this.onTouched();
    }
  }

  @HostListener('input', ['$event.target.value'])
  handleInput(value: any) {
    if (this.onChange) {
      this.onChange(parseValue(this.type, value));
    }
  }

  registerOnChange(fn: (_: any) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }
}
