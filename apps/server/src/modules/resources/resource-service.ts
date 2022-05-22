import { omit, pick } from 'lodash';
import { injectable } from 'inversify';
import { App } from '@flogo-web/core';
import {
  Resource,
  UpdateResourceContext,
  FlogoError,
  ValidationError,
  HookContext,
} from '@flogo-web/lib-server/core';
// todo: can't import directly from 'apps' barrel, it will create a circular dependency and inversify will also complain
import { HandlersService } from '../apps/handlers-service';
import { AppTriggersService } from '../apps/triggers';
import { ResourcePluginRegistry } from '../../extension';
import { ERROR_TYPES } from '../../common/errors';
import { generateShortId } from '../../common/utils';
import { ResourceRepository } from './resource.repository';
import { genericFieldsValidator, ValidatorFn } from './validation';
import { cleanInputOnCreate, cleanInputOnUpdate } from './input-cleaner';
import { ensureUniqueResourceName } from '../../common/utils/ensure-unique-resource';

const identity = i => i;

interface ExtendedResource extends Resource {
  appId: string;
}

@injectable()
export class ResourceService {
  private resourceFieldsValidator: ValidatorFn;

  constructor(
    private resourceRepository: ResourceRepository,
    private handlersService: HandlersService,
    private triggerService: AppTriggersService,
    private plugins: ResourcePluginRegistry
  ) {
    this.resourceFieldsValidator = genericFieldsValidator(type =>
      this.isTypeSupported(type)
    );
  }

  isTypeSupported(type: string) {
    return !!type && this.plugins.isKnownType(type);
  }

  async create(appId: string, resource: Partial<Resource<unknown>>) {
    const app: App = await this.getApp(appId);

    resource = cleanInputOnCreate(resource);
    this.validateResource(resource);

    resource.id = generateShortId();
    resource.name = ensureUniqueResourceName(app.resources, resource.name);

    const context: HookContext = this.createHookContext(resource);
    await this.resourceHooks.wrapAndRun('create', context, async hookContext => {
      await this.resourceRepository.create(appId, hookContext.resource as Resource);
      hookContext.resource = await this.findOne(resource.id);
      return hookContext;
    });
    return context.resource;
  }

  async update(resourceId: string, changes: Partial<Resource>) {
    const existingResource = await this.findOne(resourceId);
    if (!existingResource) {
      throw new FlogoError(`No resource with id ${resourceId}`, {
        type: ERROR_TYPES.COMMON.NOT_FOUND,
      });
    }
    const appId = existingResource.appId;
    changes = cleanInputOnUpdate(changes);
    const updatedResource = { ...existingResource, ...changes };
    this.validateResource({ ...existingResource, ...changes });

    const context: UpdateResourceContext = {
      ...this.createHookContext(updatedResource),
      changes,
      existingResource,
    };
    await this.resourceHooks.wrapAndRun(
      'update',
      context,
      async (hookContext: UpdateResourceContext) => {
        await this.resourceRepository.update(appId, { ...changes, id: resourceId });
        hookContext.resource = await this.findOne(resourceId);
        return hookContext;
      }
    );
    return context.resource;
  }

  async list(
    appId: string,
    options: { filter?: { by: string; value: any }; project?: any }
  ): Promise<Resource[]> {
    const app: App = await this.getApp(appId);

    let resources = app && app.resources ? app.resources : [];
    resources = applyListFilters(resources, options);

    resources = await mapAsync<Resource>(resources, async (resource: Resource) => {
      const context = this.createHookContext(resource);
      await this.resourceHooks.wrapAndRun('list', context, identity);
      return context.resource as Resource;
    });

    return resources;
  }

  async findOne(resourceId: string): Promise<ExtendedResource> {
    let app = await this.resourceRepository.findAppByResourceId(resourceId);
    if (!app) {
      return null;
    }
    const foundResource = app.resources.find(r => r.id === resourceId);
    if (!foundResource) {
      return null;
    }
    const context = this.createHookContext(foundResource);
    await this.resourceHooks.wrapAndRun('list', context, hookContext => {
      const resource = hookContext.resource as any;
      resource.appId = app.id;
      const triggers = app.triggers.filter(isTriggerForResource(resource.id));
      app = omit(app, ['triggers', 'resources']);
      hookContext.resource = { ...resource, app, triggers };
    });
    return context.resource as ExtendedResource;
  }

  async getResource(resourceId: string): Promise<Resource> {
    const app = await this.resourceRepository.findAppByResourceId(resourceId);
    if (!app) {
      return null;
    }
    const foundResource = app.resources.find(r => r.id === resourceId);
    if (!foundResource) {
      return null;
    }
    const context = this.createHookContext(foundResource);
    await this.resourceHooks.wrapAndRun('list', context, identity);
    return context.resource as Resource;
  }

  async listRecent() {
    const recentIds = await this.resourceRepository.listRecent();
    const recentResources = await mapAsync(recentIds, ({ id }) => this.findOne(id));
    return recentResources.filter(Boolean);
  }

  async remove(resourceId) {
    const resource: ExtendedResource = await this.findOne(resourceId);
    if (!resource) {
      return false;
    }

    const context = this.createHookContext(resource);
    await this.resourceHooks.runBefore('remove', context);
    const wasRemoved = await this.resourceRepository.remove(resourceId);
    if (wasRemoved) {
      await this.handlersService.removeByResourceId(resourceId);
      await this.triggerService.purgeTriggersByAppId(resource.appId);
      await this.resourceHooks.runAfter('remove', context);
    }
    return wasRemoved;
  }

  removeFromRecentByAppId(appId) {
    return this.resourceRepository.removeFromRecent('appId', appId);
  }

  private get resourceHooks() {
    return this.plugins.resourceHooks;
  }

  private createHookContext(resource): HookContext {
    return {
      resource,
    };
  }

  private validateResource(resource: Partial<Resource<unknown>>) {
    const errors = this.resourceFieldsValidator(resource);
    if (errors) {
      throw new ValidationError('Validation error', errors);
    }
  }

  private async getApp(appId: string) {
    if (!appId) {
      throw new FlogoError('Missing app id', { type: ERROR_TYPES.COMMON.NOT_FOUND });
    }

    const app: App = await this.resourceRepository.getApp(appId);
    if (!app) {
      throw new FlogoError('App not found', { type: ERROR_TYPES.COMMON.NOT_FOUND });
    }
    return app;
  }
}

function mapAsync<T>(collection = [], mapFn: (e) => Promise<T>): Promise<T[]> {
  return Promise.all(collection.map(mapFn));
}

function isTriggerForResource(resourceId: string) {
  // TODO: actionId is resourceId now?
  const isHandlerForResource = h => h.resourceId === resourceId;
  return t => !!t.handlers.find(isHandlerForResource);
}

function applyListFilters(resources, options) {
  if (options && options.filter && options.filter.by === 'name') {
    const comparableName = options.filter.value.trim().toLowerCase();
    resources = resources.filter(a => comparableName === a.name.trim().toLowerCase());
  } else if (options && options.filter && options.filter.by === 'id') {
    resources = resources.filter(a => options.filter.value.indexOf(a.id) !== -1);
  }
  return projectOutputOnFields(resources, options.project);
}

function projectOutputOnFields(resourceArray, fields) {
  if (fields && fields.length > 0) {
    fields.push('id', 'type');
    return resourceArray.map(resource => pick(resource, fields));
  }
  return resourceArray;
}
