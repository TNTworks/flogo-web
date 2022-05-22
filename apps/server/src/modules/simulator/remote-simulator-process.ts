import got from 'got';
import Websocket from 'ws';
import { StreamRunnerProcess } from '../engine/process/stream-runner-process';

import { StreamSimulation } from '@flogo-web/core';
import ProcessStatus = StreamSimulation.ProcessStatus;

type ListenerFn = (data) => any;
const NO_OP: ListenerFn = () => {};

export class RemoteSimulatorProcess {
  private _status: ProcessStatus = ProcessStatus.New;
  private dataSubscription: (data) => any = NO_OP;
  private statusSubscription: (data) => any = NO_OP;
  private subprocess: StreamRunnerProcess;
  private ws: Websocket;

  constructor(
    private config: {
      wsUrl: string;
      restControlUrl: string;
    }
  ) {}

  isConnected() {
    return this.subprocess.isRunning();
  }

  get status() {
    return this._status;
  }

  async start() {
    return this.callRestControl('start', ProcessStatus.Running);
  }

  async restart() {
    return this.callRestControl('restart', ProcessStatus.Running);
  }

  async pause() {
    return this.callRestControl('pause', ProcessStatus.Paused);
  }

  async resume() {
    return this.callRestControl('resume', ProcessStatus.Running);
  }

  async setup(subprocess: StreamRunnerProcess) {
    this.subprocess = subprocess;
    this.updateStatus(
      this.subprocess.isRunning() ? ProcessStatus.Running : ProcessStatus.Closed
    );
    let isSubprocessClosed = false;
    let retries = 0;
    await subprocess.whenStarted;
    this.subprocess.getCurrentChildProcess().whenClosed.then(exitCode => {
      isSubprocessClosed = true;
      this.updateStatus(exitCode === 0 ? ProcessStatus.Closed : ProcessStatus.Errored);
    });
    const wsConnect = () => {
      if (isSubprocessClosed || this.subprocess !== subprocess) {
        return;
      }
      this.ws = new Websocket(this.config.wsUrl);
      this.ws.on('message', d => {
        try {
          this.dataSubscription(JSON.parse(d.toString()));
        } catch (e) {
          console.warn('Could not parse message: ', d);
          console.warn(e);
        }
      });
      this.ws.on('open', () => {
        console.log('opened ws connection');
      });
      this.ws.on('error', (e: any) => {
        console.warn('Could not connect to telemetry ws: ', e);
        if (e.code === 'ECONNREFUSED' && retries++ <= 5) {
          console.warn('Retrying...');
          setTimeout(wsConnect, 3000);
        }
      });
    };
    setTimeout(wsConnect, 2000);
  }

  teardown() {
    if (this.subprocess && this.subprocess.isRunning()) {
      this.subprocess.stop();
    }
    this.updateStatus(ProcessStatus.Closed);

    if (this.ws && [Websocket.OPEN, Websocket.CONNECTING].includes(this.ws.readyState)) {
      try {
        this.ws.close();
      } catch (err) {
        console.warn(err);
      }
    }

    this.dataSubscription = NO_OP;
    this.statusSubscription = NO_OP;
  }

  onData(fn: ListenerFn) {
    this.dataSubscription = fn;
  }

  onStatusChange(fn: ListenerFn) {
    this.statusSubscription = fn;
  }

  private updateStatus(newStatus: ProcessStatus) {
    this._status = newStatus;
    if (this.statusSubscription) {
      this.statusSubscription(this._status);
    }
  }

  private callRestControl(action: string, statusIfSuccess: ProcessStatus) {
    this.throwIfProcessUnavailable(action);
    return got.post(`${this.config.restControlUrl}/${action}`).then(r => {
      this.updateStatus(statusIfSuccess);
      return r;
    });
  }

  private throwIfProcessUnavailable(action: string) {
    if (!this.subprocess) {
      throw new Error(
        `Simulator process: Cannot ${action}! Process not found, probably was never bootstrapped`
      );
    }

    if (!this.subprocess.isRunning()) {
      throw new Error(
        `Simulator process: Cannot ${action}! Process is not available (probably already closed or errored)`
      );
    }
  }
}
