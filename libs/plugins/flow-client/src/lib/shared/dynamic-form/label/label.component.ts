import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  HostBinding,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { BaseField } from '../field-base';

@Component({
  // tslint:disable:component-selector
  // using attribute selector for accesibility e.g. <label flogo-flow-dynamic-form-label></label>
  selector: '[flogo-flow-dynamic-form-label]',
  template:
    '{{ control.value }}<ng-container *ngIf="!fieldMetadata.required && !noOptionalLabel"> (Optional)</ng-container>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class LabelComponent {
  @Input() control: AbstractControl;
  @Input() fieldMetadata: BaseField<any>;
  @Input() noOptionalLabel?: boolean;
  @HostBinding('class.df-label') hostClass = true;
}
