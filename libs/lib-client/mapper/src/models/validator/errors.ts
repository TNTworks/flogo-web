const ERROR = 'error';
const WARNING = 'warning';
export const ERROR_SEVERITY = {
  ERROR,
  WARNING,
};

export interface Position {
  start: any;
  end: any;
}

export interface ValidationError {
  type: string;
  message: string;
  severity: string;
  position: Position;
  context?: any;
}

export const TYPES = {
  ArgumentTypeMismatch: 'ArgumentTypeMismatch',
  ArgumentCountMismatch: 'ArgumentCountMismatch',
  MinimumArgumentCountMismatch: 'MinimumArgumentCountMismatch',
  UnassignableType: 'UnassignableType',
  InvalidReference: 'InvalidReference',
  InvalidPropertyReference: 'InvalidPropertyReference',
  UnexpectedMemberAccess: 'UnexpectedMemberAccess',
  IndexAccessExpected: 'IndexAccessExpected',
  IllegalIndexAccess: 'IllegalIndexAccess',
  UnexpectedIndexType: 'UnexpectedIndexType',
  StringLiteralExpected: 'StringLiteralExpected',
  UnexpectedCallExpression: 'IllegalCallExpression',
  UnexpectedExpressionCount: 'UnexpectedExpressionCount',
  InvalidExpressionResult: 'InvalidExpressionResult',
};
export { TYPES as ERROR_TYPES };

export class ErrorFactory {
  static ArgumentTypeMismatch(
    position: Position,
    msgParams: { paramName; actualType; expectedType },
    context?: any
  ) {
    return {
      position,
      context,
      type: TYPES.ArgumentTypeMismatch,
      severity: ERROR,
      message: `Expected type of parameter '${msgParams.paramName}' to be '${msgParams.expectedType}' but got '${msgParams.actualType}'.`,
    };
  }

  static ArgumentCountMismatch(
    position: Position,
    msgParams: { actualCount; expectedCount },
    context?: any
  ) {
    return {
      position,
      context,
      type: TYPES.ArgumentCountMismatch,
      severity: ERROR,
      message: `Expected ${msgParams.expectedCount} arguments, but got ${msgParams.actualCount}.`,
    };
  }

  static MinimumArgumentCountMismatch(
    position: Position,
    msgParams: { actualCount; leastExpectedCount },
    context?: any
  ) {
    return {
      position,
      context,
      type: TYPES.MinimumArgumentCountMismatch,
      severity: ERROR,
      message: `Expected at least ${msgParams.leastExpectedCount} arguments, but got ${msgParams.actualCount}.`,
    };
  }

  static UnassignableType(
    position: Position,
    msgParams: { actual: string; expected: string },
    context?: any
  ) {
    return {
      position,
      context,
      type: TYPES.UnassignableType,
      severity: ERROR,
      message: `Type '${msgParams.actual}' is not assignable to type '${msgParams.expected}'.`,
    };
  }

  static InvalidReference(
    position: Position,
    msgParams: { name: string },
    context?: any
  ) {
    return {
      position,
      context,
      type: TYPES.InvalidReference,
      severity: ERROR,
      message: `Invalid reference, cannot find name '${msgParams.name}'.`,
    };
  }

  static InvalidPropertyReference(
    position: Position,
    msgParams: { propName: string; parentName: string },
    context?: any
  ) {
    return {
      position,
      context,
      type: TYPES.InvalidPropertyReference,
      severity: ERROR,
      message: `Property '${msgParams.propName}' does not exist in '${msgParams.parentName}'.`,
    };
  }

  static UnexpectedMemberAccess(
    position: Position,
    msgParams: { propName: string; parentType: string },
    context?: any
  ) {
    return {
      position,
      context,
      type: TYPES.UnexpectedMemberAccess,
      severity: ERROR,
      message: `Unexpected access of property '${msgParams.propName}'. Cannot access a property of ${msgParams.parentType} type.`,
    };
  }

  static IndexAccessExpected(position: Position, _msgParams?: any, context?: any) {
    return {
      position,
      context,
      type: TYPES.IndexAccessExpected,
      severity: ERROR,
      message: 'Index based access expected for an array.',
    };
  }

  static IllegalIndexAccess(
    position: Position,
    msgParams: { propName: string },
    context?: any
  ) {
    return {
      position,
      context,
      type: TYPES.IllegalIndexAccess,
      severity: ERROR,
      message: `${msgParams.propName} cannot be accessed by index syntax (not an array).`,
    };
  }

  static UnexpectedIndexType(position: Position, _msgParams?: any, context?: any) {
    return {
      position,
      context,
      type: TYPES.UnexpectedIndexType,
      severity: ERROR,
      message: "An index expression argument must be of type 'string' or 'number'.",
    };
  }

  static StringLiteralExpected(position: Position, _msgParams?: any, context?: any) {
    return {
      position,
      context,
      type: TYPES.StringLiteralExpected,
      severity: ERROR,
      message: 'String literal expected.',
    };
  }

  static IllegalCallExpression(
    position: Position,
    msgParams: { calleeName: string },
    context?: any
  ) {
    return {
      position,
      context,
      type: TYPES.UnexpectedCallExpression,
      severity: ERROR,
      message: `Value of '${msgParams.calleeName}' is not callable (not a function).`,
    };
  }

  static UnexpectedExpressionCount(position: Position, _msgParams?: any, context?: any) {
    return {
      position,
      context,
      type: TYPES.UnexpectedExpressionCount,
      severity: ERROR,
      message: 'Only one expression is allowed',
    };
  }

  static InvalidExpressionResult(
    position: Position,
    msgParams: { actual: string; expected: string },
    context?: any
  ) {
    return {
      position,
      context,
      type: TYPES.InvalidExpressionResult,
      severity: ERROR,
      message: `Invalid expression result, expected ${msgParams.expected} but got ${msgParams.actual}.`,
    };
  }
}
