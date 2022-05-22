import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { timer, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { TriggersService } from '@flogo-web/lib-client/core';

const DEBOUNCE_MS = 300;
const isSameTrigger = (triggers, currentTriggerId) =>
  triggers.length === 1 && triggers[0].id === currentTriggerId;

@Injectable()
export class TriggerNameValidatorService {
  constructor(private triggersService: TriggersService) {}

  create(appId: string, triggerId: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<any> | Promise<any> => {
      return timer(DEBOUNCE_MS).pipe(
        filter(() => control.value && control.value.trim()),
        switchMap(() =>
          this.triggersService.listTriggersForApp(appId, {
            name: control.value,
          })
        ),
        map(foundTriggers => {
          if (
            foundTriggers &&
            foundTriggers.length &&
            !isSameTrigger(foundTriggers, triggerId)
          ) {
            return { nameNotUnique: true };
          }
          return null;
        })
      );
    };
  }
}
