import { IMapperResult } from './imapper-result';
import { IMappingError } from './imapping-error';

// tslint:disable-next-line:interface-over-type-literal
export type STRING_MAP<T> = { [key: string]: T };

/**
 * Details of a parsed expression string
 */
export interface ParsedExpressionDetails {
  isSyntaxValid: boolean;
  functionReferences: string[];
  memberReferences: string[];
}

/**
 * A Mapped expression and its sub expressions
 */
export interface MapExpression {
  /**
   * expression string
   * e.g.  String.concat(a.b.c,"abc")
   */
  expression: string;

  /**
   * child expression map for nested expressions
   * map<FunctionToken,MapExpression>
   * e.g. for-each(x,y)=>{ y.a = x.a, y.b = x.b}
   * e.g. for-each(p,q)=>{ p.a = q.a, p.b = q.b}
   *         child: for-each(p.a,q.a)=>{ for-each(p.a,q.a) => { p.a.x=q.a.x, p.a.y=q.a.y }}
   */
  mappings?: STRING_MAP<MapExpression>;

  /**
   * Details of a parsed expression string
   */
  parsedExpressionDetails?: ParsedExpressionDetails;

  mappingType?: number;
}

/**
 * Parse location
 */
export interface IParseLocation {
  getOffset(): number;

  getLine(): number;

  getColumn(): number;

  toString(): string;
}

/**
 * Token location
 */
export interface ITokenLocation {
  getStart(): IParseLocation;

  getEnd(): IParseLocation;
}

/**
 * Parsing Error
 */
export interface IParseError extends IMappingError {
  getLocation(): ITokenLocation;
}

/**
 * Provides different contextual schemas
 * e.g. Input Schema
 *      OutputSchema
 */
export interface ISchemaProvider {
  getSchema(contextData: STRING_MAP<any>): any;
}

/**
 * Wraps the token provided by external parser
 */
export interface IParseToken {
  token: any;

  /**
   * get Token type
   */
  getType(): any;

  /**
   * get Token id
   */
  getId(): number;

  /**
   * get Token value
   */
  getValue(): string;

  /**
   * get Token Location
   */
  getLocation(): IParseLocation;
}

/**
 * Provides Tree lookup facility
 */
export interface IParseTree {
  getToken(char_pos: number): IParseToken;

  getTree(): any;
}

/**
 * A parsing action will return a parse tree on successful parse
 * or return a parsing error
 */
export interface IParseResult extends IMapperResult {
  getParseTree(): IParseTree;
}

/**
 * Provides parsing functionality for Javascript/ES6 expressions only
 */
export interface IExpressionParser {
  parse(expression: string): IParseResult;
}
