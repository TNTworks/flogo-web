import { BaseField } from '../field-base';

export class NumberType extends BaseField<number> {
  controlType = 'FieldNumber';

  constructor(opts: any = {}) {
    super(opts);
  }
}
