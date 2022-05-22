import { ValidatorFn, Validator } from '@angular/forms';
import { ValueType } from '@flogo-web/core';

export abstract class BaseField<T> {
  name: string;
  type: ValueType;
  value: T;
  required = false;
  controlType: string;
  validators?: Array<Validator | ValidatorFn>;

  constructor(
    options: {
      name?: string;
      type?: ValueType;
      value?: any;
      required?: boolean;
      controlType?: string;
    } = {}
  ) {
    this.name = options.name;
    this.type = options.type;
    this.value = options.value;
    this.controlType = options.controlType || '';
    this.required = options.required;
  }
}
