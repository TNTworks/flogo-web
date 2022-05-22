import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SchemaAttributeDescriptor as SchemaAttribute } from '@flogo-web/core';
import { FormFieldService } from './form-field.service';
import { BaseField } from './field-base';

@Injectable()
export class FormBuilderService {
  constructor(private ngFB: FormBuilder, private formService: FormFieldService) {}

  toFormGroup(fields: SchemaAttribute[], { requireAll } = { requireAll: false }) {
    const fieldsWithControlType = fields.map(f =>
      this.formService.mapFieldsToControlType(f, requireAll)
    );
    const formGroup = this.ngFB.group({
      formFields: this.makeFormFieldsArray(fieldsWithControlType),
    });
    return { formGroup, fieldsWithControlType };
  }

  private makeFormFieldsArray(fieldsGroup: BaseField<any>[]) {
    return this.ngFB.array(fieldsGroup.map(fg => this.makeFormFieldGroup(fg)));
  }

  private makeFormFieldGroup(fieldControl: BaseField<any>) {
    const group: any = {};
    group.name = [fieldControl.name];
    group.type = [fieldControl.type];
    group.value = [fieldControl.value];
    if (fieldControl.validators) {
      group.value.push(fieldControl.validators);
    } else if (fieldControl.required) {
      group.value.push(Validators.required);
    }
    return this.ngFB.group(group);
  }
}
