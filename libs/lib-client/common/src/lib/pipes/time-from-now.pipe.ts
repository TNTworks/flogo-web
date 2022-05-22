import { Pipe, PipeTransform } from '@angular/core';
import { formatDistance, isValid, parseISO } from 'date-fns';

@Pipe({
  name: 'timeFromNow',
})
export class TimeFromNowPipe implements PipeTransform {
  transform(value: any): string {
    if (!value) {
      return '';
    } else if (typeof value === 'string') {
      value = parseISO(value);
    } else {
      value = new Date(value);
    }
    if (isValid(value)) {
      return formatDistance(value, new Date(), { addSuffix: true });
    } else {
      return '';
    }
  }
}
