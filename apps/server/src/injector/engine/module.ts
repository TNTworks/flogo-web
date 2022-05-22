import { ContainerModule, interfaces } from 'inversify';
import { TOKENS } from '../../core';
import {
  Engine,
  getInitializedEngine,
  EngineProcessDirector,
} from '../../modules/engine';
import { config } from '../../config';
import {
  SimulationPreparer,
  SimulatableAppGenerator,
  StreamSimulator,
} from '../../modules/simulator';
import { FlowExporter } from '../../modules/transfer/export/flow-exporter';
import { FlowRunnerCreator } from '../../modules/engine/process/flow-runner-creator';

export const EngineModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(TOKENS.EngineProvider).toProvider<Engine>(() => {
    return (defaultEnginePath = config.defaultEngine.path) => {
      return getInitializedEngine(defaultEnginePath);
    };
  });
  bind(EngineProcessDirector)
    .toSelf()
    .inSingletonScope();

  //todo: this should me moved to the flow plugin
  bind(FlowRunnerCreator).toSelf();

  //todo: this should me moved to the stream plugin
  bind(TOKENS.StreamSimulationConfig).toDynamicValue(() => config.streamSimulation);
  bind(SimulatableAppGenerator).toSelf();
  bind(SimulationPreparer).toSelf();
  bind(StreamSimulator).toSelf();
  bind(FlowExporter).toSelf();
});
