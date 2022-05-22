import { Injectable } from '@angular/core';

import { Observable, throwError as _throw } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Interceptor, Snapshot, Step } from '../../interfaces';
import { RestApiService } from './rest-api.service';

/**
 * Possible run status
 */
export enum RunStatusCode {
  NotStarted = '0',
  Active = '100',
  Completed = '500',
  Cancelled = '600',
  Failed = '700',
}

/**
 * Possible run state
 */
export enum RunTaskStatusCode {
  Done = 40,
  Skipped = 50,
  Failed = 100,
}

/**
 * Possible flow types in Step response
 */

export enum StepFlowType {
  MainFlow = '0',
  SubFlow = '1',
}

export interface StatusResponse {
  id: string;
  /**
   * A value from RunStatusCode or null
   * @see RunStatusCode
   */
  status: string | null;
}

export interface StoredProcessResponse {
  creationDate: string;
  description: string;
  id: string;
  name: string;
}

export interface RestartResponse {
  id: string;
}

@Injectable()
export class RunApiService {
  constructor(private restApi: RestApiService) {}

  getStatusByInstanceId(instanceId: string): Observable<StatusResponse | null> {
    return this.restApi.get(`runner/instances/${instanceId}/status`);
  }

  getStepsByInstanceId(instanceId: string): Observable<Step[]> {
    return this.restApi.get(`runner/instances/${instanceId}/steps`);
  }

  getSnapshot(instanceId: string, snapshotId: number): Observable<Snapshot> {
    return this.restApi.get(`runner/instances/${instanceId}/snapshot/${snapshotId}`);
  }

  // todo: data interface
  // todo: response interface
  startProcess(flowId: string, data: any): Observable<any> {
    return this.restApi.post<any>(`runner/processes/${flowId}/start`, {
      attrs: data,
    });
  }

  storeProcess(flowId: string): Observable<StoredProcessResponse> {
    return this.restApi.post<StoredProcessResponse>('runner/processes', {
      actionId: flowId,
    });
  }

  // TODO: original name was restartWithIcptFrom, what is "icpt?
  // TODO
  //  to do proper restart process, need to select proper snapshot, hence
  //  the current implementation is only for the last start-from-beginning snapshot, i.e.
  //  the using this.runState.processInstanceId to restart
  restartFrom(
    processInstanceId: string,
    step: number,
    interceptor: Interceptor,
    updateProcessId?: string
  ): Observable<RestartResponse> {
    // get the snapshot of the previous step
    if (step < 1) {
      return _throw(new Error(`Invalid step ${step} to start from.`));
    }
    const snapshotId = step - 1;

    return this.getSnapshot(processInstanceId, snapshotId).pipe(
      map(snapshot =>
        updateProcessId ? updateSnapshotActionUri(snapshot, updateProcessId) : snapshot
      ),
      switchMap(snapshot =>
        this.restApi.post<RestartResponse>('runner/processes/restart', {
          initialState: snapshot,
          interceptor,
        })
      )
    );

    function updateSnapshotActionUri(snapshot, newFlowId) {
      // replace the old flowURI with the newFlowID
      const pattern = new RegExp('flows/(.+)$');
      const { flowURI } = snapshot;
      return {
        ...snapshot,
        flowURI: flowURI.replace(pattern, `flows/${newFlowId}`),
      };
    }
  }
}
