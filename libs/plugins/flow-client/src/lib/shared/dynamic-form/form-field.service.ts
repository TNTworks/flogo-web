import { Injectable } from '@angular/core';
import { SchemaAttributeDescriptor as SchemaAttribute, ValueType } from '@flogo-web/core';
import { Textbox } from './textbox/textbox';
import { BaseField } from './field-base';
import { NumberType } from './number/number';
import { Radio } from './radio/radio';
import { ObjectType } from './object/objectType';

const coerceToBoolean = value => !!(value && value !== 'false');

@Injectable()
export class FormFieldService {
  mapFieldsToControlType(field: SchemaAttribute, forceRequired: boolean): BaseField<any> {
    const initOpts = {
      name: field.name,
      type: field.type,
      value: field.value,
      required: field.required || forceRequired,
    };
    switch (field.type) {
      case ValueType.String:
      case ValueType.Bytes:
      case ValueType.Datetime:
        return new Textbox(initOpts);
      case ValueType.Double:
      case ValueType.Integer:
      case ValueType.Long:
        return new NumberType(initOpts);
      case ValueType.Boolean:
        return new Radio({
          ...initOpts,
          value: coerceToBoolean(field.value),
        });
      case ValueType.Object:
      case ValueType.Array:
      case ValueType.Any:
      case ValueType.Params:
        return new ObjectType(initOpts);
      default:
        return new Textbox(initOpts);
    }
  }
}
