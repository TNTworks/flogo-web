import {
  CancellationToken,
  CompletionItem,
  CompletionList,
  LineRange,
  MarkedString,
  Thenable,
} from './monaco.types';

export interface OffsetRange {
  startOffset: number;
  endOffset: number;
}

export interface Position extends monaco.IPosition {
  offset: number;
}

export interface ClientPosition {
  x: number;
  y: number;
}

/**
 * Based on Monaco Hover but adds support for an offset based range
 */
export interface Hover {
  /**
   * The contents of this hover.
   */
  contents: MarkedString[];
  /**
   * The range to which this hover applies. When missing, the
   * editor will use the range at the current position or the
   * current position itself.
   */
  range: OffsetRange | LineRange;
}

export interface HoverProvider {
  provideHover(offset: Position, token: CancellationToken): Hover | Thenable<Hover>;
}

export interface CompletionProvider {
  provideCompletionItems(
    position: Position,
    token: CancellationToken
  ):
    | CompletionItem[]
    | Thenable<CompletionItem[]>
    | CompletionList
    | Thenable<CompletionList>;
}

export interface EditorError {
  message: string;
  location: OffsetRange;
}
