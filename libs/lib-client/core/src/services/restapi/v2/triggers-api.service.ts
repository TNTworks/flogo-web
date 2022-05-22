import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError as _throw } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { RestApiOptions, RestApiService } from '../rest-api.service';

@Injectable()
export class TriggersService {
  constructor(private restApi: RestApiService) {}

  listTriggersForApp(appId, filters?: { name?: string }) {
    const options: RestApiOptions =
      filters && filters.name ? { params: { 'filter[name]': filters.name } } : null;
    return this.restApi.get<any>(`apps/${appId}/triggers`, options).toPromise();
  }

  createTrigger(appId, trigger: any) {
    return this.restApi.post<any>(`apps/${appId}/triggers`, trigger).toPromise();
  }

  getTrigger(triggerId) {
    return this.restApi.get<any>(`triggers/${triggerId}`).toPromise();
  }

  updateTrigger(triggerId: string, trigger: any) {
    return this.restApi
      .patch<any>(`triggers/${triggerId}`, trigger)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          return _throw(this.extractErrors(err));
        })
      )
      .toPromise();
  }

  deleteTrigger(triggerId: string) {
    return this.restApi.delete(`triggers/${triggerId}`).toPromise();
  }

  public getShimTriggerBuildLink(triggerId: string) {
    return this.restApi.apiPrefix(`triggers/${triggerId}:shim`);
  }

  private extractErrors(error: HttpErrorResponse | any) {
    const body = error.error;
    if (body instanceof Error) {
      return new Error(`Unknown error: error.error.message`);
    } else {
      return body.errors || [body];
    }
  }
}
