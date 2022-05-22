import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Injectable()
@Pipe({
  name: 'translate',
})
export class FakeTranslatePipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    return value;
  }
}
