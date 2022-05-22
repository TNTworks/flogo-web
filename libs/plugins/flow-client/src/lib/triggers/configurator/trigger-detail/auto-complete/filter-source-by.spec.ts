import { of, Observable, Subject } from 'rxjs';
import { async } from '@angular/core/testing';
import { filterSourceBy } from './filter-source-by';

describe('FilterSourceByValue', () => {
  let filterTerm$: Subject<string>;
  let source$: Observable<Observable<string[]>>;
  let filteredValues$: Observable<string[]>;

  beforeEach(() => {
    filterTerm$ = new Subject<string>();
    source$ = of(of(['Option1', 'Option2', 'Value3', 'Selection4', 'Select5']));
    filteredValues$ = filterSourceBy(source$, filterTerm$);
  });

  it('Should create the filter observable', () => {
    expect(filteredValues$).toBeTruthy();
  });

  it('Should show all options without any filter value', async(() => {
    filteredValues$.subscribe(filteredValues => {
      expect(filteredValues.length).toEqual(5);
    });
    filterTerm$.next('');
  }));

  it('Should filter source based on filter value', async(() => {
    filteredValues$.subscribe(filteredValues => {
      expect(filteredValues.length).toEqual(2);
    });
    filterTerm$.next('Option');
  }));

  it('Should filter source by value with case insensitivity', async(() => {
    filteredValues$.subscribe(filteredValues => {
      expect(filteredValues.length).toEqual(2);
    });
    filterTerm$.next('sel');
  }));
});
