import { Container } from 'inversify';

import { TOKENS } from '../core';
import { logger, engineLogger } from '../common/logging';
import { ResourcePluginRegistry } from '../extension';
import { ResourceRepository } from '../modules/resources/resource.repository';

import { PersistenceModule } from './persistence/module';
import { ModelsModule } from './models/module';
import { EngineModule } from './engine/module';

export function createRootContainer(): Container {
  const rootContainer = new Container();
  rootContainer
    .bind(ResourcePluginRegistry)
    .toSelf()
    .inSingletonScope();
  rootContainer.bind(TOKENS.Logger).toConstantValue(logger);
  rootContainer.bind(TOKENS.EngineLogger).toConstantValue(engineLogger);
  rootContainer.bind(ResourceRepository).toSelf();
  rootContainer.load(PersistenceModule, ModelsModule, EngineModule);
  return rootContainer;
}
