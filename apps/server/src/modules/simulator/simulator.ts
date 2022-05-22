import { RemoteSimulatorProcess } from './remote-simulator-process';
import { Socket } from 'socket.io';
import { SimulationPreparer } from './simulation-preparer';
import { injectable } from 'inversify';

export interface SimulationAction {
  type: 'start' | 'restart' | 'resume' | 'pause' | 'stop';
  data?: any;
}

export class SimulationClient {
  private simulator: StreamSimulator;

  constructor(private socket: Socket) {
    socket.on('disconnect', () => {
      this.socket = null;
      if (this.simulator) {
        this.simulator.onClientDisconnection(this);
      }
    });

    socket.on('simulator-action', (action: SimulationAction) => {
      if (!this.simulator) {
        return;
      }

      switch (action.type) {
        case 'start':
          this.simulator.start(action.data);
          break;
        case 'pause':
          this.simulator.pause();
          break;
        case 'resume':
          this.simulator.resume();
          break;
        case 'restart':
          this.simulator.restart();
          break;
        case 'stop':
          this.simulator.stop();
          break;
      }
    });
  }

  send(data: any) {
    this.socket.emit('data', data);
  }

  emitStatus(status) {
    this.socket.emit('simulator-status', status);
  }

  register(simulator: StreamSimulator) {
    this.simulator = simulator;
  }

  unregister(simulator: StreamSimulator) {
    if (this.simulator === simulator) {
      this.simulator = null;
    }
  }

  disconnect() {
    this.socket.disconnect();
  }
}

@injectable()
export class StreamSimulator {
  private currentClient: SimulationClient;
  private currentProcess: RemoteSimulatorProcess;

  constructor(private enginePreparer: SimulationPreparer) {}

  updateClient(client: SimulationClient) {
    if (this.currentClient) {
      this.currentClient.unregister(this);
      this.currentClient.disconnect();
    }
    this.currentClient = client;
    this.currentClient.register(this);
  }

  async startNewProcess({ pipelineId, simulationDataFile, mappingsType }) {
    this.logToConsole('simulator: starting new process', {
      pipelineId,
      simulationDataFile,
      mappingsType,
    });
    this.teardownRemoteProcess();

    this.currentProcess = await this.enginePreparer.prepare({
      pipelineId,
      simulationDataFile,
      mappingsType,
      events: {
        onData: this.sendData.bind(this),
        onStatusChange: this.sendStatus.bind(this),
      },
    });
    await this.currentProcess.start().catch(error => {
      console.warn('Error starting simulator', error);
      this.stop();
    });
  }

  onClientDisconnection(client: SimulationClient) {
    if (this.currentClient === client) {
      this.logToConsole('simulator: client disconnected');
      this.currentClient.unregister(this);
      this.currentClient = null;

      this.teardownRemoteProcess();
      this.currentProcess = null;
    }
  }

  start({ pipelineId, simulationDataFile, mappingsType }) {
    this.startNewProcess({ pipelineId, simulationDataFile, mappingsType });
  }

  pause() {
    this.logToConsole('simulator: pausing');
    this.currentProcess.pause();
  }

  resume() {
    this.logToConsole('simulator: resuming');
    this.currentProcess.resume();
  }

  stop() {
    this.logToConsole('simulator: stopping');
    this.teardownRemoteProcess();
  }

  restart() {
    this.logToConsole('simulator: restarting');
    this.currentProcess.restart();
  }

  private teardownRemoteProcess() {
    if (this.currentProcess) {
      this.currentProcess.teardown();
    }
  }

  private sendData(data) {
    if (this.currentClient) {
      this.logToConsole('sending data to client', data);
      this.currentClient.send(data);
    }
  }

  private sendStatus(status) {
    if (this.currentClient) {
      this.logToConsole('sending status to client', status);
      this.currentClient.emitStatus(status);
    }
  }

  private logToConsole(...params) {
    // uncomment to enable console logging
    // console.log(...params);
  }
}
