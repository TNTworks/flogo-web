import { App } from '@flogo-web/core';

import { initDb, collections } from '../../../common/db';
import { AppTriggersService } from '../triggers';
import { mockDate, restoreDate } from './utils';
import { ContributionsService } from '../../contribs';

const NOW_ISO = '2019-06-21T21:34:16.051Z';
const VALID_REF = 'github.com/TNTworks/flogo-contrib/cool-trigger';

let triggerService: AppTriggersService;

const APP_ID = 'some-app-id';
let appsCollection: Collection<App>;

beforeEach(async () => {
  mockDate(NOW_ISO);

  await initDb({ persist: false });
  appsCollection = collections.apps;
  appsCollection.insert(getSeedApp());
  triggerService = new AppTriggersService(appsCollection, ({
    async findByRef(ref: string) {
      if (ref === VALID_REF) {
        return { ref: VALID_REF, name: 'cool trigger schema' };
      }
    },
  } as Partial<ContributionsService>) as any);
});

afterEach(() => {
  restoreDate();
});

it('creates a trigger', async () => {
  const trigger = await triggerService.create(APP_ID, {
    name: 'my trigger',
    ref: VALID_REF,
  });
  expect(trigger).toMatchObject({
    id: expect.any(String),
    name: 'my trigger',
    ref: VALID_REF,
    createdAt: NOW_ISO,
  });
});

it('updates a trigger', async () => {
  const trigger = await triggerService.create(APP_ID, {
    name: 'my trigger to update',
    description: 'some description',
    ref: VALID_REF,
  });
  await triggerService.update(trigger.id, { name: 'new trigger name' });
  expect(await triggerService.findOne(trigger.id)).toMatchObject({
    id: trigger.id,
    name: 'new trigger name',
    description: 'some description',
    ref: VALID_REF,
  });
});

it('removes a trigger', async () => {
  const trigger = await triggerService.create(APP_ID, {
    ref: VALID_REF,
    name: 'trigger to remove',
  });
  expect(trigger).toMatchObject({
    ref: VALID_REF,
    name: 'trigger to remove',
  });
  const wasRemoved = await triggerService.remove(trigger.id);
  expect(wasRemoved).toBe(true);
  expect(await triggerService.findOne(trigger.id)).toBeFalsy();
  expect(await triggerService.list(APP_ID)).toHaveLength(0);
});

it('lists triggers', async () => {
  await triggerService.create(APP_ID, { ref: VALID_REF, name: 'My Trigger 1' });
  await triggerService.create(APP_ID, { ref: VALID_REF, name: 'My Trigger 2' });
  await triggerService.create(APP_ID, { ref: VALID_REF, name: 'My Trigger 3' });
  const triggers = await triggerService.list(APP_ID);
  expect(triggers).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ name: 'My Trigger 1' }),
      expect.objectContaining({ name: 'My Trigger 2' }),
      expect.objectContaining({ name: 'My Trigger 3' }),
    ])
  );
});

function getSeedApp(): App {
  return {
    id: APP_ID,
    type: 'apptype',
    name: 'My app',
    resources: [],
    triggers: [],
  };
}
