import pick from 'lodash/pick';
import { injectable, inject } from 'inversify';
import { Collection } from 'lokijs';

import { App, Trigger } from '@flogo-web/core';

import { TOKENS } from '../../core';
import { ContributionsService } from '../contribs';
import { ErrorManager, ERROR_TYPES } from '../../common/errors';
import { CONSTRAINTS } from '../../common/validation';
import { generateShortId, ISONow } from '../../common/utils';
import { findGreatestNameIndex } from '../../common/utils/collection';
import { Validator } from './validator';

const EDITABLE_FIELDS_CREATION = ['name', 'ref', 'description', 'settings'];
const EDITABLE_FIELDS_UPDATE = ['name', 'description', 'settings'];

const getComparableTriggerName = fromName => fromName.trim().toLowerCase();

const nameExists = (triggerId, name, triggers) => {
  const comparableName = getComparableTriggerName(name);
  return !!triggers.find(
    currentTrigger =>
      getComparableTriggerName(currentTrigger.name) === comparableName &&
      currentTrigger.id !== triggerId
  );
};

/**
{
  "id": "my_rest_trigger",
  "name": "My rest trigger",
  "description": "My rest trigger description",
  "updatedAt": "2017-07-14T01:00:00+01:00Z",
  "createdAt": "2017-07-14T01:00:00+01:00Z",
  "ref": "github.com/TNTworks/flogo-contrib/trigger/rest",
  "settings": {
    "port": "9233"
  },
  "handlers": [
    {
      "actionId": "my_simple_flow",
      "settings": {
        "method": "GET",
        "path": "/test"
      },
      "actionMappings": {
        "input": [
          { "type": 1, "value": "content.customerId", "mapTo": "customerId" },
          { "type": 1, "value": "content.orderId", "mapTo": "orderId" }
        ],
        "output": [
          { "type": 1, "value": "responseCode", "mapTo": "status" },
          { "type": 1, "value": "responseData", "mapTo": "data" }
        ]
      }
    },
    {
      "actionId": "my_simple_flow_2",
      "settings": {
        "method": "GET",
        "path": "/test2"
      },
      "actionMappings": {
        "input": [
          { "type": 1, "value": "content.customerId", "mapTo": "customerId" },
          { "type": 1, "value": "content.orderId", "mapTo": "orderId" }
        ],
        "output": [
          { "type": 1, "value": "responseCode", "mapTo": "status" },
          { "type": 1, "value": "responseData", "mapTo": "data" }
        ]
      }
    }
  ]
}
 */
@injectable()
export class AppTriggersService {
  constructor(
    @inject(TOKENS.AppsDb) private appsDb: Collection<App>,
    @inject(TOKENS.ContributionsManager)
    private contributionsService: ContributionsService
  ) {}

  async create(appId, newTrigger): Promise<Trigger & { appId: string }> {
    if (!appId) {
      return Promise.reject(
        ErrorManager.makeError('App not found', {
          type: ERROR_TYPES.COMMON.NOT_FOUND,
        })
      );
    }

    const app = this.appsDb.findOne({ id: appId });

    if (!app) {
      throw ErrorManager.makeError('App not found', {
        type: ERROR_TYPES.COMMON.NOT_FOUND,
      });
    }

    const errors = Validator.validateTriggerCreate(newTrigger);
    if (errors) {
      throw ErrorManager.createValidationError('Validation error', errors);
    }

    const contribTrigger = await this.contributionsService.findByRef(newTrigger.ref);
    if (!contribTrigger) {
      throw ErrorManager.createValidationError('Validation error', [
        {
          property: 'ref',
          title: 'Trigger not installed',
          detail: 'The specified ref for contrib is not installed',
          value: newTrigger.ref,
          type: CONSTRAINTS.NOT_INSTALLED_TRIGGER,
        },
      ]);
    }

    newTrigger = cleanInput(newTrigger, EDITABLE_FIELDS_CREATION);
    newTrigger.id = generateShortId();
    newTrigger.name = ensureUniqueName(app.triggers, newTrigger.name.trim());
    newTrigger.createdAt = ISONow();
    newTrigger.updatedAt = null;
    newTrigger.handlers = [];

    app.triggers.push(newTrigger);
    this.appsDb.update(app);

    return { ...newTrigger, appId };
  }

  async update(triggerId, triggerData) {
    const appNotFound = ErrorManager.makeError('App not found', {
      type: ERROR_TYPES.COMMON.NOT_FOUND,
    });

    const trigger = await this.findOne(triggerId);
    if (!trigger) {
      throw appNotFound;
    }
    const errors = Validator.validateTriggerUpdate(triggerData);
    if (errors) {
      throw ErrorManager.createValidationError('Validation error', errors);
    }

    triggerData = cleanInput(triggerData, EDITABLE_FIELDS_UPDATE);

    const app = this.appsDb.findOne({ id: trigger.appId });
    if (!app) {
      throw appNotFound;
    }

    if (triggerData.name) {
      validateNameUnique(triggerData.name, app, triggerId);
    }

    const triggerToUpdate = app.triggers.find(t => t.id === triggerId);
    Object.assign(triggerToUpdate, triggerData);
    triggerToUpdate.updatedAt = ISONow();

    this.appsDb.update(app);

    return this.findOne(triggerId);
  }

  async findOne(triggerId): Promise<Trigger & { appId: string }> {
    const [trigger] = this.appsDb
      .chain()
      .find(<LokiQuery<any>>{ 'triggers.id': triggerId }, true)
      .map(app => {
        if (!app) {
          return null;
        }
        const foundTrigger = app.triggers.find(t => t.id === triggerId);
        return { ...foundTrigger, appId: app.id };
      })
      .data({ removeMeta: true });

    return trigger || null;
  }

  async list(appId, { name }: { name?: string } = {}) {
    const app = this.appsDb.findOne({ id: appId });
    let triggers = app && app.triggers ? app.triggers : [];
    if (name) {
      const findName = getComparableTriggerName(name);
      triggers = triggers.filter(
        trigger => findName === getComparableTriggerName(trigger.name)
      );
    }
    return triggers;
  }

  async remove(triggerId) {
    const [app] = this.appsDb
      .chain()
      .find(<LokiQuery<any>>{ 'triggers.id': triggerId }, true)
      .data();
    if (!app) {
      return false;
    }

    const triggerIndex = app.triggers.findIndex(trigger => trigger.id === triggerId);
    if (triggerIndex >= 0) {
      app.triggers.splice(triggerIndex, 1);
      this.appsDb.update(app);
      return true;
    }
    return false;
  }

  async purgeTriggersByAppId(appId: string) {
    const [app] = this.appsDb
      .chain()
      .find(<LokiQuery<any>>{ id: appId }, true)
      .data();
    if (!app) {
      return false;
    }

    app.triggers = app.triggers.filter(trigger => trigger.handlers.length > 0);
    this.appsDb.update(app);
    return true;
  }
}

function validateNameUnique(name: string, app: App, triggerId: string) {
  if (nameExists(triggerId, name, app.triggers)) {
    // do nothing
    throw ErrorManager.createValidationError('Validation error', [
      {
        property: 'name',
        title: 'Name already exists',
        detail: "There's another trigger in the app with this name",
        value: {
          triggerId,
          appId: app.id,
          name: name,
        },
        type: CONSTRAINTS.UNIQUE,
      },
    ]);
  }
}

function cleanInput(trigger, fields) {
  const cleanTrigger = pick(trigger, fields);
  if (cleanTrigger.name) {
    cleanTrigger.name = cleanTrigger.name.trim();
  }
  return cleanTrigger;
}

function ensureUniqueName(triggers, name) {
  const greatestIndex = findGreatestNameIndex(name, triggers);
  if (greatestIndex >= 0) {
    name = `${name} (${greatestIndex + 1})`;
  }
  return name;
}
