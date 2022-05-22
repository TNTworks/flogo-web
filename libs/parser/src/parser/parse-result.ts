import { CstElement, IRecognitionException, ILexingError } from 'chevrotain';
import { RootAstNode, Node } from '../ast';

export type RecognitionException = IRecognitionException;
export type LexingError = ILexingError;

export interface ParseResult<T extends Node = RootAstNode> {
  cst: CstElement;
  ast: T;
  lexErrors: LexingError[];
  parseErrors: RecognitionException[];
}
