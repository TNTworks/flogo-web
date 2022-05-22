import shortid from 'shortid';
import { injectable } from 'inversify';

import { ResourceTypes, ResourcePluginRegistry } from '../../extension';
import { importApp, ImportersResolver } from '../transfer';
import { AllContribsService } from '../all-contribs';
import { ResourceType } from '@flogo-web/lib-server/core';

function resourceImportResolver(porting: ResourceTypes): ImportersResolver {
  return {
    byType: (resourceType: string) =>
      porting.isKnownType(resourceType) ? porting.importer(resourceType) : null,
    byRef: (ref: string) => {
      const type = porting.findbyRef(ref);
      return type ? type.import : null;
    },
  };
}

function extractPluginTypesMappings(resourceTypesInfo: ResourceType<unknown>[]) {
  const typeMappings = new Map<string, string>();
  for (const resourceTypeInfo of resourceTypesInfo) {
    typeMappings.set(resourceTypeInfo.resourceType, resourceTypeInfo.type);
    if (resourceTypeInfo.additionalResourceTypes) {
      for (const additionalType of resourceTypeInfo.additionalResourceTypes) {
        typeMappings.set(additionalType, resourceTypeInfo.type);
      }
    }
  }
  return typeMappings;
}

@injectable()
export class AppImporter {
  constructor(
    private pluginRegistry: ResourcePluginRegistry,
    private allContribsService: AllContribsService
  ) {}

  async import(app) {
    const contributions = await this.allContribsService.allByRef();
    const resourceTypes = this.pluginRegistry.resourceTypes;

    const pluginTypesMapping = extractPluginTypesMappings(resourceTypes.allTypes());

    const { id, ...newApp } = await importApp(
      app,
      resourceImportResolver(resourceTypes),
      pluginTypesMapping,
      shortid.generate,
      contributions
    );
    return { id, ...newApp };
  }
}
