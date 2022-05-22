import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BaseField } from '../field-base';

@Component({
  selector: 'flogo-fb-textarea',
  templateUrl: 'textarea.component.html',
  styleUrls: ['../shared/dynamic-form.less'],
})
export class TextareaComponent {
  @Input()
  fieldGroup: FormGroup;
  @Input()
  fieldControl: BaseField<any>;
  @Input()
  hideOptionalLabel?: boolean;
}
