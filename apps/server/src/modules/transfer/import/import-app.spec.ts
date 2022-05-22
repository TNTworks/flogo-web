import { cloneDeep } from 'lodash';
import {
  ValidationError,
  ResourceImporter,
  parseResourceIdFromResourceUri,
} from '@flogo-web/lib-server/core';
import { importApp, ImportersResolver } from './import-app';

import { assertCorrectImportedApp } from '../tests/samples/imported-app';
const appToImport = require('../tests/samples/standard-app.json');
const activities = require('../tests/samples/activities.json');

const triggers = require('../tests/samples/triggers.json');

const pluginTypeMap = new Map([['flow', 'flow']]);

function idGenerator() {
  let nextId = 0;
  return () => {
    nextId++;
    return nextId + '';
  };
}

function pluginResolver(onImport): ImportersResolver {
  return {
    byRef: () => onImport,
    byType: () => onImport,
  };
}

function importerResolver(resolveResource, resolveHandler): ResourceImporter {
  return {
    resource: resolveResource,
    handler: resolveHandler,
  };
}

let contribs: Map<string, any>;

beforeAll(() => {
  contribs = new Map([...activities, ...triggers].map(c => [c.ref, c] as [string, any]));
});

test('import app', () => {
  const app = importApp(
    cloneDeep(appToImport),
    pluginResolver(
      importerResolver(
        i => i,
        (h, c) => {
          const { flowURI } = c.rawHandler.action.data;
          h.resourceId = parseResourceIdFromResourceUri(flowURI);
          return h;
        }
      )
    ),
    pluginTypeMap,
    idGenerator(),
    contribs
  );
  assertCorrectImportedApp(app);
});

test('It collects and forwards plugin import validation errors', () => {
  expect.assertions(2);
  const multiResourceApp = cloneDeep(appToImport);
  const [resource] = multiResourceApp.resources;
  multiResourceApp.resources = [
    resource,
    { ...cloneDeep(resource), id: 'flow:resource2' },
  ];
  const throwError = data => {
    throw new ValidationError('Some resource validation error', [
      {
        keyword: 'plugin-error',
        dataPath: '.foo',
      },
    ]);
  };
  try {
    importApp(
      multiResourceApp,
      pluginResolver(importerResolver(throwError, throwError)),
      pluginTypeMap,
      idGenerator(),
      contribs
    );
  } catch (e) {
    const errors = e.details.errors;
    // 1 error for handler, 2 errors for resources
    expect(errors).toHaveLength(3);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dataPath: '.resources[0].foo',
          keyword: 'plugin-error',
        }),
        expect.objectContaining({
          dataPath: '.resources[1].foo',
          keyword: 'plugin-error',
        }),
        expect.objectContaining({
          dataPath: '.triggers[0].handlers[0].foo',
          keyword: 'plugin-error',
        }),
      ])
    );
  }
});

test('It throws a validation error if resource is not supported', () => {
  expect.assertions(1);
  try {
    importApp(
      cloneDeep(appToImport),
      pluginResolver(null),
      pluginTypeMap,
      idGenerator(),
      contribs
    );
  } catch (e) {
    expect(e.details.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dataPath: '.resources[0].type',
          keyword: 'supported-resource-type',
          params: {
            type: 'flow',
          },
        }),
      ])
    );
  }
});
