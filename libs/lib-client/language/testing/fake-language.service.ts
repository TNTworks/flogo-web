import { Injectable } from '@angular/core';
import { of as observableOf, Observable } from 'rxjs';
import { LanguageService } from '@flogo-web/lib-client/language';

@Injectable()
export class FakeLanguageService implements LanguageService {
  get(key: string | Array<string>, interpolateParams?: Object): Observable<string | any> {
    return observableOf([key]);
  }

  instant(key: string | Array<string>, interpolateParams?: Object): string | any {
    return key;
  }
}
