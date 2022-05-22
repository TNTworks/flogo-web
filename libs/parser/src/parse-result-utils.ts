import { ParseResult } from './parser/parse-result';

const isEmptyArray = arr => !arr || arr.length <= 0;
export function isSuccessfulParse(parseResult: ParseResult): boolean {
  return parseResult && !hasErrors(parseResult) && !!parseResult.ast;
}

export function hasErrors(parseResult: ParseResult): boolean {
  return hasLexErrors(parseResult) || hasParseErrors(parseResult);
}

export function hasLexErrors(parseResult: ParseResult): boolean {
  return parseResult && !isEmptyArray(parseResult.lexErrors);
}

export function hasParseErrors(parseResult: ParseResult): boolean {
  return parseResult && !isEmptyArray(parseResult.parseErrors);
}
