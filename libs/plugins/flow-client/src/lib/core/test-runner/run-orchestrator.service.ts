import { Observable, combineLatest, merge, timer, of, throwError as _throw } from 'rxjs';
import {
  take,
  catchError,
  distinctUntilChanged,
  exhaustMap,
  filter,
  last,
  map,
  share,
  startWith,
  switchMap,
  takeWhile,
} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { isEqual, defaults } from 'lodash';
import {
  Interceptor,
  Step,
  RunTaskStatusCode,
  RunStatusCode,
  RunApiService,
  StatusResponse,
  ErrorService,
  Dictionary,
  StepFlowType,
} from '@flogo-web/lib-client/core';

export const ERRORS = {
  MAX_TRIALS_REACHED: 'MaxTrialsReached',
  PROCESS_NOT_COMPLETED: 'ProcessNotCompleted',
};

export { RunStatusCode, RunTaskStatusCode, Step, StepFlowType };

export interface RunStatus extends StatusResponse {
  /**
   * Trial index. Starts at 1.
   */
  trial: number;
}

interface BaseRunOptions {
  maxTrials?: number;
  queryInterval?: number;
  useProcessId?: string;
  useFlowId?: string;
}

export interface RunOptions extends BaseRunOptions {
  // todo: interface
  attrsData: Dictionary<any> | undefined;
}

export interface RerunOptions extends BaseRunOptions {
  instanceId: string;
  step: number;
  interceptor: Interceptor;
}

export interface RunProgressStore {
  /**
   * Observer when process has been registered to start
   */
  registered: Observable<{ processId: string; instanceId: string }>;
  /**
   * The state of the runner
   */
  state: Observable<RunProgress>;
  /**
   * Stream of process status changes, will emit for every trial
   */
  processStatus: Observable<RunStatus>;
  /**
   * Stream of steps, will emit only when steps change (starts with null)
   */
  steps: Observable<Step[]>;
  /**
   * Will emit the runner state once the run has completed successfully
   */
  completed: Observable<RunProgress>;
}

export interface RunProgress {
  processId: string;
  instanceId: string;
  runStatus: RunStatus;
  steps: Step[];
  // todo interface
  lastInstance: any;
}

type StartFlowFn = (processId: string) => Observable<{ id: string }>;

/**
 * Main point of interaction with services to run a flow.
 *
 * Usually only {@link RunOrchestratorService#runFromRoot} and {@link RunOrchestratorService#rerun} are required.
 *
 */
@Injectable()
export class RunOrchestratorService {
  constructor(private runService: RunApiService, private errorService: ErrorService) {}

  /**
   * Run a flow from the root task.
   *
   * @example
   * const runner = runnerService.runFromRoot({
   *   useFlowId: 'flowid',
   *   attrsData: [{"name":"params", "type":"params", "value":{ "id":3 }}]
   * });
   *
   * runner.state.subscribe(...);
   * runner.completed.subscribe(...);
   *
   * @example
   * const runner = runnerService.runFromRoot({
   *   useProcessId: "a435bcertyu",
   *   attrsData: [{"name":"params", "type":"params", "value":{ "id":3 }}],
   * });
   *
   * runner.state.subscribe(...);
   * runner.completed.subscribe(...);
   *
   * @param {object} opts - Options
   * @param {object} opts.attrsData - Input data to be used to run the flow
   * @param {string} [opts.useProcessId] - If provided will use an existing registered flow. Incompatible with useFlowId option.
   * @param {object} [opts.useFlowId] - Id of the flow to run
   * @param {number} [opts.maxTrials=20] - Max number of trials to get a status that indicates completion of the process
   * @param {number} [opts.queryInterval=500] - Polling interval to query for status (In milliseconds)
   * @return {RunProgressStore}
   * @see RunProgressStore
   * @see RunOrchestratorService#monitorProcessStatus
   */
  runFromRoot(opts: RunOptions): RunProgressStore {
    return this.startAndMonitor(opts, processId =>
      this.runService.startProcess(processId, opts.attrsData)
    );
  }

  /**
   * Rerun an existing flow from a particular step.
   *
   * @example
   * const runner = runnerService.runFromRoot({
   *   instanceId: "3aa6b7384aa876bda541662bbcc43cfa"}
   *   step: 2,
   *   useFlowId: 'someflowid',
   *   interceptor: {
   *      "tasks":[
   *         { "id":2, "inputs": [{ "name":"counterName","type":"string","required":true,"value":"number"}, ...] }
   *       ]
   *   }
   * });
   *
   * runner.state.subscribe(...);
   * runner.completed.subscribe(...);
   *
   * @example
   * const runner = runnerService.runFromRoot({
   *   useProcessId: "a435bcertyu",
   *   attrsData: [{"name":"params", "type":"params", "value":{ "id":3 }}],
   * })
   *
   *
   * @param {object} opts - Options
   * @param {string} opts.instanceId - id of the instance that will be re-run
   * @param {number} opts.step - step to start from
   * @param {object} opts.interceptor - interceptor data
   * @param {object} opts.useFlowId - id of the flow to run
   * @param {number} [opts.maxTrials=20] - Max number of trials to get a status that indicates completion of the process
   * @param {number} [opts.queryInterval=500] - Polling interval to query for status (In milliseconds)
   * @return {RunProgressStore}
   * @see RunProgressStore
   * @see RunOrchestratorService#monitorProcessStatus
   */
  rerun(opts: RerunOptions): RunProgressStore {
    const { instanceId, step, interceptor } = opts;
    return this.startAndMonitor(opts, newProcessId => {
      return this.runService.restartFrom(instanceId, step, interceptor, newProcessId);
    });
  }

  startAndMonitor(opts: BaseRunOptions, startFlow: StartFlowFn): RunProgressStore {
    const registered = this.registerAndStartFlow(opts, startFlow).pipe(share());
    const shareObservable = obs => obs.pipe(share());

    const instanceStatus = registered.pipe(
      switchMap(info => this.monitorProcessStatus(info.instanceId, opts)),
      share()
    );

    // start with null to force the stream to start emitting
    const querySteps = this.queryForSteps(instanceStatus).pipe(startWith(null));

    // merge all into a single state
    const state: Observable<RunProgress> = shareObservable(
      this.mergeState(instanceStatus, querySteps, registered)
    );

    const steps = shareObservable(this.streamSteps(registered, state));

    const completed = shareObservable(this.observeCompletion(state));

    return {
      registered,
      state,
      processStatus: instanceStatus.pipe(
        distinctUntilChanged((prev, next) => isEqual(prev, next))
      ),
      steps,
      completed,
    };
  }

  /**
   * Monitoring the status of a running process.
   *
   * Observable will emit while:
   * - Process has not started (code 0).
   * - Process is running (code 100)
   * - Process is completed (code 500). Will emit this event only once and stream will be completed.
   * - Unknown code is received (ex. null)
   *
   * Observable will error when:
   *  - Cancelled process status is encountered (code 600).
   *  - Failed process status is encountered (code 700).
   *  - Max number of trials is reached.
   *
   *  Refer to {@link RunStatusCode} for the status codes.
   *
   *  @example
   *    runner.monitorProcessStatus("123").subscribe(
   *      state => {
   *        // while process is still running and also when it is completed
   *        status.status; // code that indicates current status. Ex. not started (0), running (100) or completed (500)
   *        status.trial; // will increment after every emit
   *      },
   *      error => {
   *         error.status; // When error was caused because process was not completed (ProcessNotCompleted).
   *      },
   *      completed => {
   *        // after complete status (code 500)
   *      }
   *    );
   *
   * @see RunStatusCode
   * @see RunStatus
   * @param processInstanceID {string} - The id of a running process
   * @param {object} [opts] - Options
   * @param {number} [opts.maxTrials=20] - Max number of trials to get a status that indicates completion of the process
   * @param {number} [opts.queryInterval=500] - Polling interval to query for status (In milliseconds)
   * @return {Observable<RunStatus>} Observable of the running status. Stream will be completed after code indicating the
   * process run has finished.
   * @throws Error in observable with name {@link ERRORS | "ProcessNotCompleted"} when the process did not complete successfully.
   * Error property 'status' will contain the process status.
   * @throws Error in observable with name {@link ERRORS | "MaxTrialsReached"} when the process did not complete successfully.
   * @throws Synchronous error when processInstanceID parameter is not provided
   */
  monitorProcessStatus(
    processInstanceID: string,
    opts?: { maxTrials?: number; queryInterval?: number }
  ): Observable<RunStatus> {
    opts = defaults(
      {},
      opts,
      {
        maxTrials: 20,
        // change this small polling interval to slow down, this is for evaluating
        queryInterval: 500, // ms
      },
      opts
    );

    if (!processInstanceID) {
      throw new Error('No process instance has been logged.');
    }

    const source: Observable<RunStatus> = timer(0, opts.queryInterval).pipe(
      exhaustMap(i => {
        if (i < opts.maxTrials) {
          return this.runService.getStatusByInstanceId(processInstanceID);
        }
        // or fail when we exhaust the maximum number of attempts
        return _throw(
          this.errorService.makeOperationalError(
            ERRORS.MAX_TRIALS_REACHED,
            'Max trials reached'
          )
        );
      }),
      map((response: StatusResponse | null, index: number) => {
        response = response || { id: null, status: null };
        if (
          response.status !== RunStatusCode.Cancelled &&
          response.status !== RunStatusCode.Failed
        ) {
          const runStatus = <RunStatus>Object.assign({}, response);
          runStatus.trial = index + 1;
          runStatus.id = processInstanceID;
          return runStatus;
        } else {
          throw this.errorService.makeOperationalError(
            ERRORS.PROCESS_NOT_COMPLETED,
            `Run error. Status: ${response.status}`,
            { status: response.status }
          );
        }
      }),
      share()
    );

    const isStatusCompleted = (status: string) => status === RunStatusCode.Completed;

    return merge(
      source.pipe(takeWhile(runStatus => !isStatusCompleted(runStatus.status))),
      source.pipe(
        filter(runStatus => isStatusCompleted(runStatus.status)),
        take(1)
      )
    );
  }

  registerAndStartFlow(
    opts: BaseRunOptions,
    startFlow: StartFlowFn
  ): Observable<{ processId: string; instanceId: string }> {
    return this.registerFlowIfNeeded(opts).pipe(
      switchMap(processId =>
        startFlow(processId).pipe(
          map(instance => ({ processId, instanceId: instance.id }))
        )
      )
    );
  }

  registerFlowIfNeeded(opts: {
    useFlowId?: string;
    useProcessId?: string;
  }): Observable<string> {
    let registered;
    if (opts.useFlowId) {
      registered = this.runService
        .storeProcess(opts.useFlowId)
        .pipe(map(storedProcess => storedProcess.id));
    } else if (opts.useProcessId) {
      registered = of(opts.useProcessId);
    } else {
      throw new Error('Provided info was not enough to run a flow');
    }
    return registered;
  }

  queryForSteps(processStatusMonitor: Observable<RunStatus>): Observable<Step[]> {
    const shouldQuery = status =>
      status === RunStatusCode.Active || status === RunStatusCode.Completed;
    return processStatusMonitor.pipe(
      filter(runState => runState && shouldQuery(runState.status)),
      switchMap(runState => this.runService.getStepsByInstanceId(runState.id))
    );
  }

  streamSteps(
    registered: Observable<{ instanceId: string }>,
    stateStream: Observable<RunProgress>
  ) {
    return registered.pipe(
      exhaustMap(registerInfo => {
        return stateStream.pipe(
          catchError(error => {
            // query steps one last time if process failed or was cancelled
            if (registerInfo.instanceId && error.name === ERRORS.PROCESS_NOT_COMPLETED) {
              return this.runService
                .getStepsByInstanceId(registerInfo.instanceId)
                .pipe(map(steps => ({ steps })));
            }
            return _throw(error);
          }),
          map(state => (state as RunProgress).steps),
          distinctUntilChanged((prev, next) => isEqual(prev, next))
        );
      })
    );
  }

  private mergeState(
    instanceStatus$: Observable<RunStatus>,
    querySteps$: Observable<Step[] | null>,
    processRegistered$: Observable<{ instanceId: string; processId: string }>
  ): Observable<RunProgress> {
    return combineLatest(querySteps$, instanceStatus$, processRegistered$).pipe(
      map(([steps, runStatus, registeredInfo]) => ({
        instanceId: registeredInfo.instanceId,
        processId: registeredInfo.processId,
        runStatus,
        steps,
        lastInstance: null,
      }))
    );
  }

  private observeCompletion(stateStream: Observable<RunProgress>) {
    return stateStream.pipe(
      last(),
      map(state => {
        return {
          ...state,
          lastInstance: { steps: state.steps },
        };
      })
    );
  }
}
