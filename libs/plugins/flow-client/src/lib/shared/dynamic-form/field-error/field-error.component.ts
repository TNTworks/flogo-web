import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

const errorFormatters: { [errorType: string]: (error?: any) => string } = {
  required: error => 'Property is required',
  notAnObject: error => `Value cannot be parsed as json`,
};

const formatErrorMessage = ([errorName, error]: [string, any]) =>
  errorFormatters[errorName](error);

@Component({
  selector: 'flogo-flow-dynamic-field-error',
  templateUrl: './field-error.component.html',
  styleUrls: ['./field-error.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldErrorComponent implements OnChanges {
  @Input() validationErrors: ValidationErrors | null;
  errorMessages: string[] | null;

  ngOnChanges() {
    if (this.validationErrors) {
      this.errorMessages = Object.entries(this.validationErrors).map(formatErrorMessage);
    }
  }
}
