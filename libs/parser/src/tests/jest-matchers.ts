import 'jest';
import { ParseResult } from '../parser/parse-result';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveBeenSuccessfullyParsed();
      toBeExpressionOfType(type: string);
    }
  }
}

const fail = message => ({ message, pass: false });

expect.extend({
  toBeExpressionOfType(parseResult: ParseResult, expectedType: string) {
    if (!parseResult) {
      return fail(() => `Expected a ParseResult but got ${parseResult}`);
    } else if (!parseResult.ast) {
      return fail(() => `No .ast property found in recieved parse result`);
    }
    const ast = parseResult.ast;

    if (ast.type !== 'ExprStmt') {
      return fail(
        () => `Expected an expression statement (ExprStmt) but got ${ast.type}`
      );
    }

    const typeOfChildExpression = ast['x'] ? ast['x'].type : undefined;
    if (typeOfChildExpression !== expectedType) {
      return fail(
        () =>
          `Expected child expression to be "${expectedType}" but got "${typeOfChildExpression}`
      );
    }

    return {
      pass: true,
      message: `Recieved expected parse result of expression statement of type ${expectedType}`,
    };
  },
  toHaveBeenSuccessfullyParsed(parseResult: ParseResult, expectedType: string) {
    if (!parseResult) {
      return fail(() => `Expected a ParseResult but got ${parseResult}`);
    }

    const errors = [];

    if (!parseResult.ast && !this.isNot) {
      errors.push('Expecting parse result to have an .ast property but none found');
    }

    if (parseResult.lexErrors && parseResult.lexErrors.length > 0) {
      errors.push(
        `Expecting 0 lexing errors but found ${parseResult.lexErrors.length}: \n` +
          this.utils.printReceived(parseResult.lexErrors)
      );
    }

    if (parseResult.parseErrors && parseResult.parseErrors.length > 0) {
      errors.push(
        `Expecting 0 parse errors but found ${parseResult.parseErrors.length}: \n` +
          this.utils.printReceived(parseResult.parseErrors)
      );
    }

    const hasErrors = errors.length > 0;
    return {
      pass: !hasErrors,
      message: hasErrors
        ? () => errors.join('. ')
        : () => 'No errors found in parse result',
    };
  },
});
