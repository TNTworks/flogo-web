import { ContainerModule, interfaces } from 'inversify';
import { collections } from '../../common/db';
import { indexer } from '../../common/db/indexer';
import { TOKENS } from '../../core';

export const PersistenceModule = new ContainerModule((bind: interfaces.Bind) => {
  bind(TOKENS.AppsDb).toDynamicValue(() => collections.apps);
  bind(TOKENS.ResourceIndexerDb).toConstantValue(indexer);
});
