import { of, from, throwError as _throw, concat } from 'rxjs';
import { isEqual, last } from 'lodash';

import { finalize } from 'rxjs/operators';
import Spy = jasmine.Spy;

import { RunApiService, StatusResponse, ErrorService } from '@flogo-web/lib-client/core';

import {
  ERRORS,
  RunStatusCode,
  RunOrchestratorService,
} from './run-orchestrator.service';

describe('Service: RunOrchestratorService', function(this: {
  DEFAULT_PROCESS_ID: string;
  errorService: ErrorService;
  runServiceMock: RunApiService;
  service: RunOrchestratorService;
}) {
  beforeAll(() => {
    this.DEFAULT_PROCESS_ID = '123';
  });

  beforeEach(() => {
    this.runServiceMock = jasmine.createSpyObj<RunApiService>('runService', [
      'getStatusByInstanceId',
      'getStepsByInstanceId',
      'storeProcess',
    ]);
    this.errorService = new ErrorService();
    this.service = new RunOrchestratorService(this.runServiceMock, new ErrorService());
  });

  describe('::monitorProcessStatus', () => {
    it('Should throw an error when process id is not provided', () => {
      expect(this.service.monitorProcessStatus).toThrowError();
    });

    it('Should complete when flow execution is completed', done => {
      const expectedSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [
        RunStatusCode.Completed,
      ]);
      setUpResponseSequence(
        <Spy>this.runServiceMock.getStatusByInstanceId,
        expectedSequence
      );
      expectSequenceCompleted(this.service, this.runServiceMock, expectedSequence, done);
    });

    it('Should continue while flow is running', done => {
      const expectedSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [
        RunStatusCode.Active,
        RunStatusCode.Active,
        RunStatusCode.Active,
        RunStatusCode.Completed,
      ]);
      setUpResponseSequence(
        <Spy>this.runServiceMock.getStatusByInstanceId,
        expectedSequence
      );
      expectSequenceCompleted(this.service, this.runServiceMock, expectedSequence, done);
    });

    it('Should continue when process has not started or when unknown status is received', done => {
      const expectedSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [
        RunStatusCode.NotStarted,
        RunStatusCode.Active,
        9999,
        'unknown',
        RunStatusCode.Completed,
      ]);
      setUpResponseSequence(
        <Spy>this.runServiceMock.getStatusByInstanceId,
        expectedSequence
      );
      expectSequenceCompleted(this.service, this.runServiceMock, expectedSequence, done);
    });

    it('Should emit an error after max attempts reached', done => {
      const responseSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [
        RunStatusCode.NotStarted,
        RunStatusCode.Active,
        RunStatusCode.Active,
        RunStatusCode.Active,
        RunStatusCode.Active,
      ]);
      setUpResponseSequence(
        <Spy>this.runServiceMock.getStatusByInstanceId,
        responseSequence
      );

      expectSequenceWithError(
        this.service,
        responseSequence,
        error => {
          expect(error).toBeDefined('No error passed to callback');
          expect(error.name).toEqual(ERRORS.MAX_TRIALS_REACHED);
        },
        done,
        3
      );
    });

    it('Should emit an error when flow execution fails', done => {
      const responseSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [
        RunStatusCode.NotStarted,
        RunStatusCode.Active,
        RunStatusCode.Failed,
      ]);
      setUpResponseSequence(
        <Spy>this.runServiceMock.getStatusByInstanceId,
        responseSequence
      );

      expectSequenceWithError(
        this.service,
        responseSequence,
        error => {
          expect(error).toBeDefined('No error passed to callback');
          expect(error.name).toEqual(ERRORS.PROCESS_NOT_COMPLETED);
          expect(error.status).toEqual(
            RunStatusCode.Failed,
            `Expected error.status to be ${RunStatusCode.Failed} but found ${error.status}`
          );
        },
        done
      );
    });

    it('Should emit an error when flow execution is cancelled', done => {
      const responseSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [
        RunStatusCode.NotStarted,
        RunStatusCode.Active,
        RunStatusCode.Cancelled,
      ]);
      setUpResponseSequence(
        <Spy>this.runServiceMock.getStatusByInstanceId,
        responseSequence
      );

      expectSequenceWithError(
        this.service,
        responseSequence,
        error => {
          expect(error).toBeDefined('No error passed to callback');
          expect(error.name).toEqual(ERRORS.PROCESS_NOT_COMPLETED);
          expect(error.status).toEqual(RunStatusCode.Cancelled);
        },
        done
      );
    });

    function expectSequenceCompleted(
      service: RunOrchestratorService,
      runServiceMock: RunApiService,
      sequence: any[],
      done
    ) {
      let count = 0;
      service.monitorProcessStatus('123', { queryInterval: 2, maxTrials: 10 }).subscribe(
        state => {
          expect(state.status).toEqual(
            sequence[count].status,
            `Trial ${count} expected status ${sequence[count].status} but found ${state.status}`
          );
          count++;
        },
        err => {
          console.error('Expect sequence caught error:', err.stack);
        },
        () => {
          const queryCount = (<jasmine.Spy>(
            runServiceMock.getStatusByInstanceId
          )).calls.count();
          expect(queryCount <= sequence.length).toBeTruthy();
          expect(count).toEqual(sequence.length);
          done();
        }
      );
    }

    function expectSequenceWithError(
      service: RunOrchestratorService,
      sequence: any[],
      onError: (error) => void,
      done: () => void,
      maxAttempts?: number
    ) {
      let count = 0;

      const subscriber = {
        onError,
      };
      spyOn(subscriber, 'onError').and.callThrough();

      service
        .monitorProcessStatus('123', {
          queryInterval: 1,
          maxTrials: maxAttempts,
        })
        .pipe(
          finalize(() => {
            expect(subscriber.onError).toHaveBeenCalled();
            if (maxAttempts) {
              expect(count).toEqual(maxAttempts);
            }
            done();
          })
        )
        .subscribe(
          state => {
            expect(state.status).toEqual(
              sequence[count].status,
              `Trial ${count} expected status ${sequence[count].status} but found ${state.status}`
            );
            count++;
          },
          error => subscriber.onError(error)
        );
    }
  });
  // monitor process status />

  describe('::registerFlowIfNeeded', () => {
    it('When useProcessId option is provided it should just return that processId', done => {
      this.service
        .registerFlowIfNeeded({ useProcessId: 'custom-flow' })
        .subscribe(result => {
          expect(result).toEqual('custom-flow');
          done();
        });
    });

    it('When useFlowId option is provided it should register the flow and return the process id', done => {
      const storeProcessMock = <jasmine.Spy>this.runServiceMock.storeProcess;
      storeProcessMock.and.returnValue(of({ id: '456' }));

      this.service.registerFlowIfNeeded({ useFlowId: 'abcd' }).subscribe(result => {
        expect(storeProcessMock).toHaveBeenCalledTimes(1);
        expect(result).toEqual('456');
        done();
      });
    });
  });

  describe('::streamSteps', () => {
    const setup = (stateSeqPieces: any[], errorStream) => {
      const state = {
        processId: '123',
        instanceId: '456',
        runStatus: { id: 1, status: RunStatusCode.Active },
        steps: [],
        lastInstance: null,
      };
      const stateSeq = stateSeqPieces.map(toMerge => Object.assign({}, state, toMerge));
      const stateStream = concat(from(stateSeq), errorStream);

      const registeredStream = of({ processId: '123', instanceId: '456' });

      return {
        stateSeq,
        registeredStream,
        stateStream,
      };
    };

    it('Should fetch steps one time more after process failed', done => {
      const setupData = setup(
        [{ steps: [1] }, { steps: [1, 2] }],
        _throw(
          this.errorService.makeOperationalError(
            ERRORS.PROCESS_NOT_COMPLETED,
            'Run failed'
          )
        )
      );
      const { stateSeq, registeredStream, stateStream } = setupData;

      const mockStepsByInstance = <jasmine.Spy>this.runServiceMock.getStepsByInstanceId;
      mockStepsByInstance.and.returnValue(of([1, 2, 3]));

      const receivedSteps = [];
      const expectedSteps = stateSeq.map(s => s.steps).concat([[1, 2, 3]]);
      console.log(expectedSteps);

      const subscriber = {
        onError() {},
      };
      spyOn(subscriber, 'onError');

      this.service
        .streamSteps(registeredStream, stateStream)
        .pipe(
          finalize(() => {
            expect(receivedSteps).toEqual(expectedSteps);
            expect(mockStepsByInstance).toHaveBeenCalledTimes(1);
            expect(mockStepsByInstance.calls.mostRecent().args).toEqual(['456']);
            done();
          })
        )
        .subscribe(steps => {
          receivedSteps.push(steps);
        }, subscriber.onError);
    });

    it('Should stop after process failed for an unknown reason', done => {
      const setupData = setup(
        [{ steps: [1] }, { steps: [1, 2] }],
        _throw(new Error('unknown error'))
      );
      const { stateSeq, registeredStream, stateStream } = setupData;

      const receivedSteps = [];
      const expectedSteps = stateSeq.map(s => s.steps);

      const subscriber = jasmine.createSpyObj('subscriber', ['onError']);

      this.service
        .streamSteps(registeredStream, stateStream)
        .pipe(
          finalize(() => {
            expect(receivedSteps).toEqual(expectedSteps);
            const mockStepsByInstance = <jasmine.Spy>(
              this.runServiceMock.getStepsByInstanceId
            );
            expect(subscriber.onError).toHaveBeenCalled();
            expect(mockStepsByInstance).not.toHaveBeenCalled();
            done();
          })
        )
        .subscribe(steps => receivedSteps.push(steps), subscriber.onError);
    });
  });

  describe('::startAndMonitor', () => {
    it('State stream should get steps only for active and completed statuses', done => {
      const statusSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [
        RunStatusCode.NotStarted,
        RunStatusCode.Active,
        RunStatusCode.Completed,
      ]);
      setUpResponseSequence(
        <Spy>this.runServiceMock.getStatusByInstanceId,
        statusSequence
      );

      const stepSequence = [1, 2, 3, 4, 5];
      setUpResponseSequence(<Spy>this.runServiceMock.getStepsByInstanceId, stepSequence);

      const emittedSteps = [];
      const subscriber = {
        onNext(next) {
          if (!isEqual(next.steps, last(emittedSteps))) {
            emittedSteps.push(next.steps);
          }
        },
        onComplete() {},
        onError(error) {
          console.error(error);
        },
      };
      spyOn(subscriber, 'onNext').and.callThrough();
      spyOn(subscriber, 'onComplete');
      spyOn(subscriber, 'onError').and.callThrough();

      spyOn(this.service, 'registerAndStartFlow').and.returnValue(
        of({ instanceId: '123', processId: '456' })
      );

      this.service
        .startAndMonitor(
          { useProcessId: '456', queryInterval: 1, maxTrials: 10 },
          processId => of({ id: '456' })
        )
        .state.pipe(
          finalize(() => {
            const mockedMethod = <Spy>this.runServiceMock.getStepsByInstanceId;
            expect(mockedMethod).toHaveBeenCalledTimes(2);
            expect(mockedMethod.calls.allArgs()).toEqual([
              [this.DEFAULT_PROCESS_ID],
              [this.DEFAULT_PROCESS_ID],
            ]);
            expect(this.service.registerAndStartFlow).toHaveBeenCalledTimes(1);

            expect(emittedSteps).toEqual([null, 1, 2]);

            expect(subscriber.onComplete).toHaveBeenCalled();
            // 4 = one for each status and one for each step of that status
            expect(subscriber.onNext).toHaveBeenCalledTimes(5);
            expect(subscriber.onError).not.toHaveBeenCalled();
            done();
          })
        )
        .subscribe(subscriber.onNext, subscriber.onError, subscriber.onComplete);
    });

    it('State should emit as soon as the flow is registered', done => {
      const statusSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [
        RunStatusCode.NotStarted,
        RunStatusCode.Active,
        RunStatusCode.Completed,
      ]);
      setUpResponseSequence(
        <Spy>this.runServiceMock.getStatusByInstanceId,
        statusSequence
      );

      const stepSequence = [1, 2, 3, 4, 5];
      setUpResponseSequence(<Spy>this.runServiceMock.getStepsByInstanceId, stepSequence);

      const emittedSteps = [];
      const subscriber = {
        onNext(next) {
          if (!isEqual(next.steps, last(emittedSteps))) {
            emittedSteps.push(next.steps);
          }
        },
        onComplete() {},
        onError(error) {
          console.error(error);
        },
      };
      spyOn(subscriber, 'onNext').and.callThrough();
      spyOn(subscriber, 'onComplete');
      spyOn(subscriber, 'onError').and.callThrough();

      spyOn(this.service, 'registerAndStartFlow').and.returnValue(
        of({ instanceId: '123', processId: '456' })
      );

      this.service
        .startAndMonitor(
          { useProcessId: '456', queryInterval: 1, maxTrials: 10 },
          processId => of({ id: '456' })
        )
        .state.pipe(
          finalize(() => {
            const mockedMethod = <Spy>this.runServiceMock.getStepsByInstanceId;
            expect(mockedMethod).toHaveBeenCalledTimes(2);
            expect(mockedMethod.calls.allArgs()).toEqual([
              [this.DEFAULT_PROCESS_ID],
              [this.DEFAULT_PROCESS_ID],
            ]);
            expect(this.service.registerAndStartFlow).toHaveBeenCalledTimes(1);

            expect(emittedSteps).toEqual([null, 1, 2]);

            expect(subscriber.onComplete).toHaveBeenCalled();
            // 4 = one for each status and one for each step of that status
            expect(subscriber.onNext).toHaveBeenCalledTimes(5);
            expect(subscriber.onError).not.toHaveBeenCalled();
            done();
          })
        )
        .subscribe(subscriber.onNext, subscriber.onError, subscriber.onComplete);
    });

    it('State stream should catch an error response', done => {
      const statusSequence = genStatusResponseSequence(this.DEFAULT_PROCESS_ID, [
        RunStatusCode.NotStarted,
        RunStatusCode.Active,
        RunStatusCode.Failed,
      ]);
      setUpResponseSequence(
        <Spy>this.runServiceMock.getStatusByInstanceId,
        statusSequence
      );

      const stepSequence = [1, 2, 3, 4, 5];
      setUpResponseSequence(<Spy>this.runServiceMock.getStepsByInstanceId, stepSequence);
      spyOn(this.service, 'registerAndStartFlow').and.returnValue(
        of({ instanceId: '123', processId: '456' })
      );

      const emittedSteps = [];
      const subscriber = {
        onNext: next => {
          if (!isEqual(next.steps, last(emittedSteps))) {
            emittedSteps.push(next.steps);
          }
        },
        onError: error => {
          expect(error).toBeDefined('No error passed to callback');
          expect(error.name).toEqual(ERRORS.PROCESS_NOT_COMPLETED);
          expect(error.status).toEqual(RunStatusCode.Failed);
        },
      };
      spyOn(subscriber, 'onError').and.callThrough();

      this.service
        .startAndMonitor(
          { useProcessId: '456', queryInterval: 1, maxTrials: 10 },
          processId => of({ id: '456' })
        )
        .state.pipe(
          finalize(() => {
            const mockedMethod = <Spy>this.runServiceMock.getStepsByInstanceId;
            expect(mockedMethod).toHaveBeenCalledTimes(1);
            expect(mockedMethod.calls.allArgs()).toEqual([[this.DEFAULT_PROCESS_ID]]);

            expect(emittedSteps).toEqual([null, 1]);

            expect(subscriber.onError).toHaveBeenCalled();
            done();
          })
        )
        .subscribe(subscriber.onNext, subscriber.onError);
    });
  });

  function genStatusResponseSequence(id, statusValues: any[]): StatusResponse[] {
    return statusValues.map((status, trial) => ({ id, status, trial }));
  }

  function setUpResponseSequence(spy: jasmine.Spy, sequence: any[]) {
    const promiseSequence = sequence.map(value => of(value));
    spy.and.returnValues(...promiseSequence);
  }
});
