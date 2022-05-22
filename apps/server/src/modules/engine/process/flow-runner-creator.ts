import { injectable, inject } from 'inversify';
import { FlowRunnerProcess } from './flow-runner-process';
import { EngineProcessDirector } from './engine-process-director';
import { Logger } from 'winston';
import { TOKENS } from '../../../core';
import { Engine } from '../engine';

@injectable()
export class FlowRunnerCreator {
  constructor(
    @inject(TOKENS.EngineProvider) private getEngine: () => Promise<Engine>,
    private engineProcessDirector: EngineProcessDirector,
    @inject(TOKENS.EngineLogger) private engineLogger: Logger
  ) {}

  async createAndStart(): Promise<FlowRunnerProcess> {
    const process = new FlowRunnerProcess(this.engineProcessDirector, this.engineLogger);
    const engine = await this.getEngine();
    await process.start(engine.getProjectDetails());
    return process;
  }
}
