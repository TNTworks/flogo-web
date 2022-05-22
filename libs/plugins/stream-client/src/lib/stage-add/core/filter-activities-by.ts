import { combineLatest, Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { isEmpty, filter as lodashFilter } from 'lodash';

import { Activity } from './stage-add-options';

const filterList = (activities, filterText) => {
  if (filterText && !isEmpty(filterText)) {
    return lodashFilter(
      activities,
      (activity: Activity) =>
        activity.title.toLowerCase().indexOf(filterText.toLowerCase()) >= 0
    );
  } else {
    return activities;
  }
};

export function filterActivitiesBy(
  sourceList$: Observable<Activity[]>,
  filterText$: ReplaySubject<string>
): Observable<Activity[]> {
  return combineLatest(sourceList$, filterText$).pipe(
    map(([activityList, searchTerm]) => filterList(activityList, searchTerm))
  );
}
