import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { FormBuilderService } from './form-builder.service';
import { BaseField } from './field-base';

@Component({
  selector: 'flogo-flow-dynamic-form',
  templateUrl: 'form-builder.component.html',
})
export class FormBuilderComponent implements OnInit {
  @Input()
  fields: any;
  @Output()
  setFormGroup = new EventEmitter<FormGroup>();
  fieldsWithControlType: BaseField<any>[];
  fbForm: FormGroup;

  constructor(private formBuilder: FormBuilderService) {}

  get formFields() {
    return <FormArray>this.fbForm.get('formFields');
  }

  ngOnInit() {
    const { formGroup, fieldsWithControlType } = this.formBuilder.toFormGroup(
      this.fields,
      { requireAll: true }
    );
    this.fbForm = formGroup;
    this.fieldsWithControlType = fieldsWithControlType;
    this.setFormGroup.emit(this.fbForm);
  }
}
