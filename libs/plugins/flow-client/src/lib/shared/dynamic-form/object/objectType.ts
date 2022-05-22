import { isObject, isEmpty } from 'lodash';
import { AbstractControl, Validators, ValidationErrors } from '@angular/forms';
import { ValueType } from '@flogo-web/core';
import { BaseField } from '../field-base';

function isObjectValidator(control: AbstractControl): ValidationErrors | null {
  return !isEmpty(control.value) && !isObject(control.value)
    ? { notAnObject: true }
    : null;
}

export class ObjectType extends BaseField<any> {
  controlType = 'FieldObject';

  constructor(opts: any = {}) {
    super(opts);
    this.createValidators();
  }

  private createValidators() {
    this.validators = [];
    if (this.required) {
      this.validators.push(Validators.required);
    }
    if (this.type !== ValueType.Any) {
      this.validators.push(isObjectValidator);
    }
  }
}
