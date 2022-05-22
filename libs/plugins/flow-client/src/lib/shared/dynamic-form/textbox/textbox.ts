import { BaseField } from '../field-base';

export class Textbox extends BaseField<string> {
  controlType = 'FieldTextBox';

  constructor(opts: any = {}) {
    super(opts);
  }
}
