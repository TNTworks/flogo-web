import { Component, Input, OnChanges } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import {
  ErrorMissingResolvableProperty,
  ErrorRequired,
  ErrorSyntaxError,
  ErrorTypeMismatch,
  ErrorTypes,
  ErrorUnknownResolverName,
  ErrorValueNotAllowed,
} from '../../settings-validation';

const errorFormatters: { [errorType: string]: (error?: any) => string } = {
  [ErrorTypes.Required]: (error: ErrorRequired) => 'Property is required',
  [ErrorTypes.ValueNotAllowed]: (error: ErrorValueNotAllowed) =>
    `Value not allowed, expected one of: ${error.allowedValues.join(', ')}`,
  [ErrorTypes.SyntaxError]: (error: ErrorSyntaxError) =>
    'Expression cannot be parsed, use $property[name] or $env[VAR_NAME]',
  [ErrorTypes.MissingResolvableProperty]: (error: ErrorMissingResolvableProperty) => {
    if (error.resolverName === 'env') {
      return 'Missing variable name, use: $env[VAR_NAME]';
    } else if (error.resolverName === 'property') {
      return 'Missing property name, use: $property[propertyName]';
    } else {
      return `Missing property name for resolver "$${error.resolverName}"`;
    }
  },
  [ErrorTypes.UnknownResolverName]: (error: ErrorUnknownResolverName) =>
    `Resolver "$${error.name}" is not allowed, expecting $env or $property`,
  [ErrorTypes.TypeMismatch]: (error: ErrorTypeMismatch) =>
    `Expected ${error.expectedType} type`,
};

const formatErrorMessage = ([errorName, error]: [string, any]) =>
  errorFormatters[errorName](error);

@Component({
  selector: 'flogo-configuration-settings-field-error',
  templateUrl: './field-error.component.html',
  styleUrls: ['./field-error.component.less'],
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
