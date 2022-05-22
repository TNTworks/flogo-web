import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, timer, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ResourceService } from '@flogo-web/lib-client/core';

export class UniqueNameValidator {
  static make(resourceService: ResourceService, appId: string): AsyncValidatorFn {
    return createUniqueNameValidator(resourceService, appId);
  }
}

function createUniqueNameValidator(
  resourceService: ResourceService,
  appId: string
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<any> | Promise<any> => {
    return timer(400).pipe(
      switchMap(() => {
        if (!control.value || !control.value.trim()) {
          return of(null);
        }
        return resourceService.listResourcesWithName(control.value, appId);
      }),
      map(result => {
        let validationResult = null;
        if (result && result.length) {
          validationResult = { uniqueInvalid: true };
        }
        return validationResult;
      })
    );
  };
}
