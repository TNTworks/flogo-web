import { inject, injectable } from 'inversify';
import { Collection } from 'lokijs';
import { App } from '@flogo-web/core';
import { Resource } from '@flogo-web/lib-server/core';
import { TOKENS } from '../../core';
import { ISONow } from '../../common/utils';
import { Database } from '../../common/database.service';
import { Logger } from '../../common/logging';
import { CONSTRAINTS } from '../../common/validation';
import { ErrorManager, ERROR_TYPES } from '../../common/errors';

const RECENT_RESOURCES_ID = 'resources:recent';
const MAX_RECENT = 10;

@injectable()
export class ResourceRepository {
  constructor(
    @inject(TOKENS.AppsDb) private appsCollection: Collection<App>,
    @inject(TOKENS.ResourceIndexerDb) private indexerDb: Database,
    @inject(TOKENS.Logger) private logger: Logger
  ) {}

  async getApp(appId): Promise<App> {
    return this.appsCollection.findOne({ id: appId });
  }

  async create(appId: string, resource: Resource): Promise<void> {
    resource.createdAt = ISONow();
    resource.updatedAt = null;

    this.appsCollection.findAndUpdate({ id: appId }, app => {
      app.resources.push({
        ...resource,
        createdAt: ISONow(),
        updatedAt: null,
      });
    });
  }

  async update(
    appId: string,
    resource: Partial<Resource> & { id: string }
  ): Promise<boolean> {
    const app = this.appsCollection.findOne({ id: appId });
    if (!app) {
      ErrorManager.makeError('App not found', {
        type: ERROR_TYPES.COMMON.NOT_FOUND,
      });
    }

    if (resource.name) {
      this.throwIfNameNotUnique(app, resource);
    }

    const resourceIndex = app.resources.findIndex(t => t.id === resource.id);
    if (resourceIndex < 0) {
      throw new Error('Error while saving flow');
    }

    const newResource = Object.assign({}, app.resources[resourceIndex], resource, {
      updatedAt: ISONow(),
    });

    app.resources[resourceIndex] = newResource;
    this.appsCollection.update(app);
    storeAsRecent(this.indexerDb, { id: resource.id, appId }).catch(e =>
      this.logger.error(e)
    );
    return true;
  }

  async findAppByResourceId(resourceId: string) {
    const [app] = this.appsCollection
      .chain()
      .find(<LokiQuery<any>>{ 'resources.id': resourceId }, true)
      .data();
    return app;
  }

  async listRecent() {
    return this.indexerDb
      .findOne({ _id: RECENT_RESOURCES_ID })
      .then(all => (all && all.resources ? all.resources : []));
  }

  async remove(resourceId: string) {
    const [app] = this.appsCollection
      .chain()
      .find(
        <LokiQuery<any>>{
          'resources.id': resourceId,
        },
        true
      )
      .data();
    if (!app) {
      return false;
    }

    const resourceIndex = app.resources.findIndex(r => r.id === resourceId);
    if (resourceIndex < 0) {
      return false;
    }

    app.resources.splice(resourceIndex, 1);
    this.appsCollection.update(app);
    this.logIfFailed(removeFromRecent(this.indexerDb, 'id', resourceId));
    return true;
  }

  removeFromRecent(compareField: string, fieldVal: any) {
    return removeFromRecent(this.indexerDb, compareField, fieldVal);
  }

  private logIfFailed(promise: Promise<any>) {
    promise.catch(e => this.logger.error(e));
  }

  private throwIfNameNotUnique(app, resource: Partial<Resource> & { id: string }) {
    const isNameUnique = !(app.resources || []).find(resourceNameComparator(resource));
    if (!isNameUnique) {
      ErrorManager.createValidationError('Validation error', [
        {
          property: 'name',
          title: 'Name already exists',
          detail: "There's another resource in the app with this name",
          value: {
            resourceId: resource.id,
            appId: app.id,
            name: resource.name,
          },
          type: CONSTRAINTS.UNIQUE,
        },
      ]);
    }
  }
}

const comparableName = name => name.trim().toLowerCase();
function resourceNameComparator(resource: Partial<Resource>) {
  const resourceName = comparableName(resource.name);
  return (r: Resource) => comparableName(r.name) === resourceName && r.id !== resource.id;
}

function storeAsRecent(indexerDb: Database, resourceInfo: { id: string; appId: string }) {
  const findQuery = { _id: RECENT_RESOURCES_ID };
  const updateQuery = {} as { $set?: { resources: Partial<Resource>[] } };

  return new Promise((resolve, reject) => {
    indexerDb.collection.findOne(
      findQuery,
      (error, recentResources: { resources: Partial<Resource>[] }) => {
        if (error) {
          reject(error);
          return;
        }

        recentResources = recentResources || { resources: [] };
        const oldResources = recentResources.resources;

        const existingResourcesIndex = oldResources.findIndex(
          a => a.id === resourceInfo.id
        );
        if (existingResourcesIndex > -1) {
          oldResources.splice(existingResourcesIndex, 1);
        }

        const newRecentResources = [resourceInfo, ...oldResources.slice(0, MAX_RECENT)];

        updateQuery.$set = { resources: newRecentResources };
      }
    );
    indexerDb.collection.update(findQuery, updateQuery, { upsert: true }, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function removeFromRecent(indexerDb: Database, compareField, fieldVal) {
  if (!['id', 'appId'].includes(compareField)) {
    throw new TypeError('Field can only be id or appId');
  }

  const findQuery = { _id: RECENT_RESOURCES_ID };
  const updateQuery: any = {};
  if (compareField === 'id') {
    findQuery['resource.id'] = fieldVal;
    updateQuery.$pull = { resource: { id: fieldVal } };
  } else {
    findQuery['resource.appId'] = fieldVal;
    updateQuery.$pull = { resource: { appId: fieldVal } };
  }

  return indexerDb.findOne(findQuery).then(result => {
    if (result) {
      return indexerDb.update(findQuery, updateQuery, {});
    }
    return null;
  });
}
