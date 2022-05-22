import { ValueType } from '@flogo-web/core';

export enum ErrorTypes {
  Required = 'required',
  ValueNotAllowed = 'notAllowed',
  SyntaxError = 'syntaxError',
  UnknownResolverName = 'unknownResolverName',
  MissingResolvableProperty = 'missingResolvableProperty',
  TypeMismatch = 'typeMismatch',
}

export type ErrorRequired = true;

export interface ErrorValueNotAllowed {
  allowedValues: any[];
}

export interface ErrorSyntaxError {
  parsingErrors: any[];
}

export interface ErrorUnknownResolverName {
  name: string;
  allowed: string[];
}

export interface ErrorMissingResolvableProperty {
  resolverName: string;
}

export interface ErrorTypeMismatch {
  expectedType: ValueType;
}
