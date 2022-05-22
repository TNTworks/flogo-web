import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'objectPropertiesPipe', pure: false })
export class ObjectPropertiesPipe implements PipeTransform {
  transform(value: any, args: any[] = null): any {
    return Object.keys(value || {});
  }
}
