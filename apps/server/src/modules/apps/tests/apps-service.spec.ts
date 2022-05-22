import { initDb, collections } from '../../../common/db';
import { ResourceService } from '../../resources';

import { AppsService } from '../apps-service';
import { mockDate, restoreDate } from './utils';

const NOW_ISO = '2019-06-21T21:34:16.051Z';
let appsService: AppsService;

beforeEach(async () => {
  await initDb({ persist: false });
  mockDate(NOW_ISO);
  appsService = new AppsService(
    collections.apps,
    null,
    ({
      removeFromRecentByAppId: appId => Promise.resolve(),
    } as Partial<ResourceService>) as any,
    null,
    null,
    null
  );
});

afterEach(() => {
  restoreDate();
});

it('saves an app', async () => {
  const app = await appsService.create({ name: 'myApp' });
  expect(app).toMatchObject({
    id: expect.any(String),
    name: 'myApp',
    updatedAt: null,
    createdAt: NOW_ISO,
  });
});

it('updates an app', async () => {
  const app = await appsService.create({ name: 'appToUpdate' });
  expect(app).toMatchObject({
    name: 'appToUpdate',
  });
  await appsService.update(app.id, { name: 'new name' });
  expect(await appsService.findOne(app.id)).toMatchObject({ name: 'new name' });
});

it('removes an app', async () => {
  const app = await appsService.create({ name: 'app to remove' });
  expect(app).toMatchObject({
    name: 'app to remove',
  });
  await appsService.remove(app.id);
  expect(await appsService.findOne(app.id)).toBeFalsy();
  expect(await appsService.find()).toHaveLength(0);
});

it('lists apps', async () => {
  await appsService.create({ name: 'some app 1' });
  await appsService.create({ name: 'some app 2' });
  await appsService.create({ name: 'some app 3' });
  const apps = await appsService.find();
  expect(apps).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'some app 1' }),
      expect.objectContaining({ name: 'some app 2' }),
      expect.objectContaining({ name: 'some app 3' }),
    ])
  );
});
