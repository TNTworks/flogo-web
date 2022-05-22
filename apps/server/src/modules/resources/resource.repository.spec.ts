import { App } from '@flogo-web/core';
import { initDb, collections } from '../../common/db';
import { Database } from '../../common/database.service';
import { constructApp } from '../../core/models/app';
import { ResourceRepository } from './resource.repository';

const APP_ID = 'my-app-id';

describe('Resource repository', () => {
  let resourceRepository: ResourceRepository;
  let appsCollection: Collection<App>;

  beforeAll(() => initDb({ persist: false }));

  beforeEach(async () => {
    collections.apps.clear({ removeIndices: true });
    appsCollection = collections.apps;
    appsCollection.insert(
      constructApp(
        {
          name: 'my app',
          type: 'ui-app',
        },
        () => APP_ID
      )
    );

    resourceRepository = new ResourceRepository(appsCollection, new Database(undefined), {
      error: () => {},
    } as any);
    await resourceRepository.create(APP_ID, {
      id: 'stored-resource',
      name: 'stored-resource',
      type: 'resource',
      data: {},
    });
  });

  it('should save a new resource', async () => {
    await resourceRepository.create(APP_ID, {
      id: 'new-resource',
      name: 'new resource',
      type: 'resource',
      data: {},
    });
    const app = await resourceRepository.getApp(APP_ID);
    expect(app.resources).toHaveLength(2);
    expect(app.resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'new-resource',
          name: 'new resource',
          type: 'resource',
        }),
      ])
    );
  });

  it('finds an app by resource id', async () => {
    await resourceRepository.create(APP_ID, {
      id: 'cool-resource',
      name: 'my resource',
      type: 'resource',
      data: {},
    });
    const app = await resourceRepository.findAppByResourceId('cool-resource');
    expect(app).toMatchObject({
      id: APP_ID,
      name: 'my app',
      type: 'ui-app',
    });
  });

  it('should update an existing resource', async () => {
    await resourceRepository.update(APP_ID, {
      id: 'stored-resource',
      name: 'updated resource',
      data: {
        it: 'works',
      },
    });
    const app = await resourceRepository.getApp(APP_ID);
    expect(app.resources).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'stored-resource',
          name: 'updated resource',
        }),
      ])
    );
  });

  it('should remove a resource', async () => {
    await resourceRepository.create(APP_ID, {
      id: 'resource-to-remove',
      name: 'my resource',
      type: 'resource',
      data: {},
    });
    let app = await resourceRepository.getApp(APP_ID);
    expect(app.resources).toHaveLength(2);

    const removeResult = await resourceRepository.remove('resource-to-remove');
    expect(removeResult).toBe(true);
    app = await resourceRepository.getApp(APP_ID);

    expect(app.resources).toHaveLength(1);
    expect(app.resources).not.toEqual([
      expect.objectContaining({
        id: 'resource-to-remove',
      }),
    ]);
  });
});
