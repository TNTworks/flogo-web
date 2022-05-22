import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'flogoLogsSearch',
})
export class SearchPipe implements PipeTransform {
  transform(value, term: string) {
    term = term.toLowerCase();
    return value.filter(item => (item.message || '').toLowerCase().indexOf(term) !== -1);
  }
}
