import { URL } from 'url';
import { tmpdir } from 'os';
import { join } from 'path';
import { injectable, inject } from 'inversify';
import { Logger } from 'winston';

import { StreamSimulation, Resource } from '@flogo-web/core';

import { Engine, EngineProcessDirector } from '../engine';
import { TOKENS } from '../../core';
import { writeJSONFile } from '../../common/utils/file';
import { RemoteSimulatorProcess } from './remote-simulator-process';
import { StreamRunnerProcess } from '../engine/process/stream-runner-process';
import { SimulatableAppGenerator } from './simulatable-app-generator';
import { SimulationConfiguration } from './simulation-config';
import { ResourceService } from '../resources';

export interface PrepareOptions {
  pipelineId: string;
  simulationDataFile: string;
  mappingsType: StreamSimulation.InputMappingType;
  events: {
    onData: (data) => any;
    onStatusChange: (status) => any;
  };
}

const TMP_PATH = join(tmpdir(), 'stream-simulating-app.json');

@injectable()
export class SimulationPreparer {
  constructor(
    @inject(TOKENS.EngineProvider) private engineProvider: () => Promise<Engine>,
    private engineProcessDirector: EngineProcessDirector,
    private simulatableAppGenerator: SimulatableAppGenerator,
    private resourceService: ResourceService,
    @inject(TOKENS.StreamSimulationConfig) private config: SimulationConfiguration,
    @inject(TOKENS.EngineLogger) private engineLogger: Logger
  ) {}

  async prepare({
    pipelineId,
    simulationDataFile,
    mappingsType,
    events,
  }: PrepareOptions): Promise<RemoteSimulatorProcess> {
    const { restControlUrl, wsUrl } = this.config;
    const parsedRestUrl = new URL(restControlUrl);
    const resource = await this.resourceService.getResource(pipelineId);
    await this.syncSimulationConfig(resource, { inputMappingType: mappingsType });
    const flogoJson = await this.simulatableAppGenerator.generateFor(resource, {
      filePath: simulationDataFile,
      port: parsedRestUrl.port,
      mappingsType,
    });
    await writeJSONFile(TMP_PATH, flogoJson);
    const remoteSimulatorProcess = new RemoteSimulatorProcess({
      restControlUrl: restControlUrl,
      wsUrl: wsUrl,
    });
    remoteSimulatorProcess.onStatusChange(events.onStatusChange);
    remoteSimulatorProcess.onData(events.onData);
    const engineProcess = new StreamRunnerProcess(
      this.engineProcessDirector,
      this.engineLogger
    );
    engineProcess.setAppJsonPath(TMP_PATH);
    const engine = await this.engineProvider();
    await engineProcess.start(engine.getProjectDetails());
    remoteSimulatorProcess.setup(engineProcess);
    return remoteSimulatorProcess;
  }

  private async syncSimulationConfig(
    resource: Resource,
    config: { inputMappingType: StreamSimulation.InputMappingType }
  ) {
    let resourceData = resource.data as StreamSimulation.ResourceConfig;
    if (
      !resourceData.simulation ||
      resourceData.simulation.inputMappingType !== config.inputMappingType
    ) {
      resourceData = {
        ...resourceData,
        simulation: {
          ...resourceData.simulation,
          inputMappingType: config.inputMappingType,
        },
      };
    }
    await this.resourceService.update(resource.id, { data: resourceData });
  }
}
