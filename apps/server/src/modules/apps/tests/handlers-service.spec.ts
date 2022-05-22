import { App } from '@flogo-web/core';
import { initDb, collections } from '../../../common/db';
import { mockDate, restoreDate } from './utils';
import { HandlersService } from '../handlers-service';

const APP_ID = 'my-app-id';
const TRIGGER_ID = 'trigger-1';
const LINKED_RESOURCE_ID = 'linked-resource';
const UNLINKED_RESOURCE_ID = 'unlinked-resource';

let handlersService: HandlersService;
let appsCollection: Collection<App>;

beforeEach(async () => {
  await initDb({ persist: false });
  appsCollection = collections.apps;
  appsCollection.insert(getSeedApp());
  handlersService = new HandlersService(appsCollection);
});

afterEach(() => {
  restoreDate();
});

it('creates handlers', async () => {
  expect(await handlersService.findOne(TRIGGER_ID, UNLINKED_RESOURCE_ID)).toBeFalsy();
  await handlersService.save(TRIGGER_ID, UNLINKED_RESOURCE_ID, {});
  expect(await handlersService.findOne(TRIGGER_ID, UNLINKED_RESOURCE_ID)).toBeTruthy();
});

it('updates handlers', async () => {
  expect(await handlersService.findOne(TRIGGER_ID, LINKED_RESOURCE_ID)).toEqual(
    expect.objectContaining({
      settings: {
        mySetting: 'foo',
      },
    })
  );
  await handlersService.save(TRIGGER_ID, LINKED_RESOURCE_ID, {
    settings: {
      somethingElse: 'bar',
    },
  });
  expect(await handlersService.findOne(TRIGGER_ID, LINKED_RESOURCE_ID)).toEqual(
    expect.objectContaining({
      settings: {
        somethingElse: 'bar',
      },
    })
  );
});

it('removes handlers', async () => {
  expect(await handlersService.findOne(TRIGGER_ID, LINKED_RESOURCE_ID)).toBeTruthy();
  await handlersService.remove(TRIGGER_ID, LINKED_RESOURCE_ID);
  expect(await handlersService.findOne(TRIGGER_ID, LINKED_RESOURCE_ID)).toBeFalsy();
});

it('should remove handlers by resource id', async () => {
  expect(await handlersService.findOne(TRIGGER_ID, LINKED_RESOURCE_ID)).toBeTruthy();
  await handlersService.removeByResourceId(LINKED_RESOURCE_ID);
  expect(await handlersService.findOne(TRIGGER_ID, LINKED_RESOURCE_ID)).toBeFalsy();
});

it('lists handlers', async () => {
  await handlersService.save(TRIGGER_ID, UNLINKED_RESOURCE_ID, {
    settings: {
      somethingElse: 'bar',
    },
  });
  expect(await handlersService.list(TRIGGER_ID)).toHaveLength(2);
});

function getSeedApp(): App {
  return {
    id: APP_ID,
    type: 'apptype',
    name: 'My app',
    resources: [
      {
        id: LINKED_RESOURCE_ID,
        name: 'my resource 1',
        type: 'resourcetype',
        data: {},
      },
      {
        id: UNLINKED_RESOURCE_ID,
        name: 'my resource 2',
        type: 'resourcetype',
        data: {},
      },
    ],
    triggers: [
      {
        id: TRIGGER_ID,
        name: 'trigger 1',
        ref: 'github.com/some/ref',
        createdAt: null,
        updatedAt: null,
        settings: {},
        handlers: [
          {
            resourceId: LINKED_RESOURCE_ID,
            settings: {
              mySetting: 'foo',
            },
            outputs: {},
          },
        ],
      },
    ],
  };
}
