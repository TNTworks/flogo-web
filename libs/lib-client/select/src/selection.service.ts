import { Injectable } from '@angular/core';
import { SelectEvent } from './select-event';
import { Subject } from 'rxjs';

@Injectable()
export class SelectionService {
  private selectionSrc = new Subject<SelectEvent>();
  public selection$ = this.selectionSrc.asObservable();
  public fieldId?: string;

  select(option: SelectEvent) {
    this.selectionSrc.next(option);
  }

  prefixOptionId(optionId: string) {
    return `${this.fieldId}-option-${optionId}`;
  }
}
