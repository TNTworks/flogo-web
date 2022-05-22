import { Injectable } from '@angular/core';
import { RestApiService } from '../rest-api.service';
import { TriggerHandler } from '../../../interfaces';

@Injectable()
export class HandlersService {
  constructor(private restApiService: RestApiService) {}

  updateHandler(triggerId, actionId, handlerSettings) {
    return this.restApiService
      .put<TriggerHandler>(`triggers/${triggerId}/handlers/${actionId}`, handlerSettings)
      .toPromise();
  }

  getHandler(triggerId, actionId) {
    return this.restApiService
      .get(`triggers/${triggerId}/handlers/${actionId}`)
      .toPromise();
  }

  deleteHandler(actionId, triggerId) {
    return this.restApiService
      .delete(`triggers/${triggerId}/handlers/${actionId}`)
      .toPromise();
  }
}
