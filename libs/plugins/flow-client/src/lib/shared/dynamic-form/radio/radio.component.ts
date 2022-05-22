import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseField } from '../field-base';

@Component({
  selector: 'flogo-fb-radio',
  templateUrl: 'radio.component.html',
  styleUrls: ['../shared/dynamic-form.less', 'radio.component.less'],
})
export class RadioComponent {
  @Input()
  fieldGroup: FormGroup;
  @Input()
  fieldControl: BaseField<any>;
  @Input()
  hideOptionalLabel?: boolean;
}
