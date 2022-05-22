import { of as observableOf, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';

export class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}

  public getTranslation(lang: string): Observable<any> {
    return this.http.get(`/i18n/${lang}.json`).pipe(
      catchError((err: any) => {
        console.warn(`Could not load translations for language "${lang}"`);
        return observableOf({});
      })
    );
  }
}

export function createTranslateLoader(http: HttpClient) {
  return new CustomTranslateLoader(http);
}
