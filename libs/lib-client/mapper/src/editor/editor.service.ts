import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { EditorContext, InsertEvent } from './types';
export { EditorContext, InsertEvent };

@Injectable()
export class EditorService {
  private insertSrc = new Subject<InsertEvent>();
  insert$: Observable<InsertEvent> = this.insertSrc.asObservable();
  private dragOverSrc = new Subject<{ x: number; y: number }>();
  dragOver$: Observable<{
    x: number;
    y: number;
  }> = this.dragOverSrc.asObservable();

  insertText(string: string, replaceTokenAtPosition?: { x: number; y: number }) {
    this.insertSrc.next({ text: string, replaceTokenAtPosition });
  }

  dragOver(position: { x: number; y: number }) {
    this.dragOverSrc.next(position);
  }
}
