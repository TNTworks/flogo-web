import { ChildProcess } from 'child_process';
import { injectable } from 'inversify';
import { RunningChildProcess } from './running-child-process';
import { EngineProjectDetails } from '../engine';
import { execEngine } from './exec-controller';

class ProcessWrapper {
  constructor(
    public childProcess: RunningChildProcess,
    public hooks: EngineProcessConfig
  ) {}

  isClosed() {
    return !this.childProcess || this.childProcess.closed;
  }
}

interface EngineProcessConfig {
  engineDetails: EngineProjectDetails;
  resolveEnv?: () => { [key: string]: string };
  afterStart?: (instance: RunningChildProcess) => any;
  afterStop?: (exitCode: number, instance: RunningChildProcess) => any;
}

@injectable()
export class EngineProcessDirector {
  private currentProcess: ProcessWrapper;

  isAnyProcessRunning() {
    return this.currentProcess && !this.currentProcess.isClosed();
  }

  isProcessStillRunning(process: ChildProcess) {
    // todo is there a better way to check for process equality like using pid?
    return this.isAnyProcessRunning() && this.currentProcess.childProcess === process;
  }

  async acquire(config: EngineProcessConfig) {
    if (this.isAnyProcessRunning()) {
      await this.kill();
    }
    const engineDetails = config.engineDetails;
    const childProcess = execEngine(engineDetails.path, engineDetails.executableName, {
      binDir: engineDetails.binDir,
      env: config.resolveEnv ? config.resolveEnv() : {},
    });
    this.currentProcess = new ProcessWrapper(childProcess, config);
    if (config.afterStart) {
      config.afterStart(childProcess);
    }
    childProcess.whenClosed.then(exitCode => {
      if (exitCode !== 0 || exitCode !== null) {
        console.warn(
          `Warning: Engine process exited with non zero code. Exit code: ${exitCode}`
        );
      }
      if (config.afterStop) {
        config.afterStop(exitCode, childProcess);
      }
    });
    return this.currentProcess.childProcess;
  }

  kill(): Promise<number> {
    if (!this.isAnyProcessRunning()) {
      return Promise.resolve(0);
    }
    const childProcess = this.currentProcess.childProcess;
    childProcess.kill();
    return childProcess.whenClosed;
  }
}
