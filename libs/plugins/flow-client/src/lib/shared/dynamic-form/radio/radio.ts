import { BaseField } from '../field-base';

export class Radio extends BaseField<boolean> {
  controlType = 'FieldRadio';

  constructor(opts: any = {}) {
    super(opts);
  }
}
