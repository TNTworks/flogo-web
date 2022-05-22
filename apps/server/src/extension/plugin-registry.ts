import { injectable, inject } from 'inversify';
import { Logger } from 'winston';

import {
  ResourceType,
  ResourceHooks,
  ResourceExtensionRegistrar,
} from '@flogo-web/lib-server/core';

import { TOKENS } from '../core';
import { HookApplicator } from './hooks';
import { ResourceTypes } from './porting';

@injectable()
export class ResourcePluginRegistry implements ResourceExtensionRegistrar {
  readonly resourceTypes: ResourceTypes;
  readonly resourceHooks: HookApplicator;

  constructor(@inject(TOKENS.Logger) private logger: Logger) {
    this.resourceHooks = new HookApplicator(logger);
    this.resourceTypes = new ResourceTypes(logger);
  }

  isKnownType(type: string) {
    return this.resourceTypes.isKnownType(type);
  }

  addType(resourceType: ResourceType) {
    this.resourceTypes.load(resourceType);
  }

  useHooks(resourceHooks: ResourceHooks) {
    this.resourceHooks.load(resourceHooks);
  }
}
