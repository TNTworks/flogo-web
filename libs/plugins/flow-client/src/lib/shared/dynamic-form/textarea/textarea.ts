import { BaseField } from '../field-base';

export class Textarea extends BaseField<any> {
  controlType = 'FieldTextArea';

  constructor(opts: any = {}) {
    super(opts);
  }
}
