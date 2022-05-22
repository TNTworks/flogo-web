import {
  IExpressionParser,
  IParseError,
  IParseLocation,
  IParseResult,
  IParseToken,
  IParseTree,
  ITokenLocation,
} from './map-model';
import { EnumMapperErrorCodes, IMappingError } from './imapping-error';

/**
 * Parse Location Wrapper
 */
export class ParseLocation implements IParseLocation {
  static newLocation(offset: number, line: number, column: number): IParseLocation {
    return new ParseLocation(offset, line, column);
  }

  constructor(private offset: number, private line: number, private column: number) {}

  getOffset(): number {
    return this.offset;
  }

  getLine(): number {
    return this.line;
  }

  getColumn(): number {
    return this.column;
  }

  toString(): string {
    return (
      '{ "offset": ' +
      this.offset +
      ', "line": ' +
      this.line +
      ', "column":' +
      this.column +
      ' }'
    );
  }
}

/**
 * Token Location
 */
export class TokenLocation implements ITokenLocation {
  static newLocation(start: IParseLocation, end: IParseLocation): ITokenLocation {
    return new TokenLocation(start, end);
  }

  constructor(private start: IParseLocation, private end: IParseLocation) {}

  getStart(): IParseLocation {
    return this.start;
  }

  getEnd(): IParseLocation {
    return this.end;
  }
}

/**
 * Parser Error Wrapper
 */
export class ParseError implements IParseError {
  errorCode: EnumMapperErrorCodes;
  errorMsg: string;

  static newError(error: any) {
    return new ParseError(error);
  }

  constructor(private error: any) {
    // TODO: extract the parser error and analyze it to
    // set the error code and message
    if (error.name && error.name === 'SyntaxError') {
      this.errorCode = EnumMapperErrorCodes.M_INVALID_SYNTAX;
    }
    if (error.message) {
      this.errorMsg = error.message;
    }
  }

  getErrorCode(): EnumMapperErrorCodes | number {
    return this.errorCode;
  }

  getErrorMessage(): string {
    return this.errorMsg;
  }

  getLocation(): ITokenLocation {
    let start: IParseLocation = ParseLocation.newLocation(-1, -1, -1);
    let end: IParseLocation = ParseLocation.newLocation(-1, -1, -1);
    if (this.error.location) {
      if (this.error.location.start) {
        start = ParseLocation.newLocation(
          this.error.location.start.offset,
          this.error.location.start.line,
          this.error.location.start.column
        );
        end = ParseLocation.newLocation(
          this.error.location.end.offset,
          this.error.location.end.line,
          this.error.location.end.column
        );
      }
    }
    return TokenLocation.newLocation(start, end);
  }

  toString(): string {
    return this.errorCode + ' : ' + this.errorMsg;
  }
}

/**
 * Parse Tree wrapper
 */
export class ParseTree implements IParseTree {
  static newTree(pTree: any): IParseTree {
    return new ParseTree(pTree);
  }

  constructor(private tree: any) {}

  getTree(): any {
    return this.tree;
  }

  getToken(char_pos: number): IParseToken {
    return null;
  }
}

/**
 * Parser Result Wrapper
 */
export class ParseResult implements IParseResult {
  errors: IMappingError[] = [];

  static newResult(result: any, error?: any): IParseResult {
    return new ParseResult(result, error);
  }

  constructor(private result: any, error?: any) {
    if (error) {
      this.errors.push(ParseError.newError(error));
    }
  }

  isValid(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): IMappingError[] {
    return this.errors;
  }

  getParseTree(): IParseTree {
    return ParseTree.newTree(this.result);
  }
}

/**
 * Expression Parser
 */
export class ExpressionParser implements IExpressionParser {
  parse(expr: string): IParseResult {
    try {
      // const result = mapparser.parse(expr);
      // return ParseResult.newResult(result);
    } catch (error) {
      return ParseResult.newResult(null, error);
    }
  }
}
