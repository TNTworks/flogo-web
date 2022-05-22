import { exportApp } from './export-app';
import {
  FlogoAppModel,
  App,
  ContributionSchema,
  TriggerSchema,
  ContributionType,
  ValueType,
} from '@flogo-web/core';

test('it exports an app', () => {
  const exported = exportApp(
    getAppToExport(),
    () => {
      return {
        resource: resource => ({
          id: resource.id,
          data: {
            name: resource.name,
          },
        }),
        handler(handler, context) {
          handler.action.settings = {
            resourceId: 'exported=' + context.resource.id,
          };
          return handler;
        },
      };
    },
    new Map<string, ContributionSchema>(getContributionSchemas()),
    type =>
      ({
        flow: { ref: 'github.com/project-flogo/flow', resourcePrefix: 'flow' },
        stream: { ref: 'github.com/project-flogo/stream', resourcePrefix: 'pipeline' },
      }[type])
  );
  expect(exported).toEqual(getExpectedApp());
});

function getAppToExport(): App {
  return {
    id: 'jAnX0TkmL',
    name: 'my cool app',
    type: 'flogo:app',
    version: '',
    description: 'with a description',
    createdAt: '2019-02-15T02:37:52.286Z',
    updatedAt: '2019-02-15T02:53:04.116Z',
    triggers: [
      {
        id: 'UOIarucDh',
        name: 'Receive HTTP Message',
        ref: 'some_path_to_repo/trigger/rest',
        description: 'Simple REST Trigger',
        settings: {
          port: 3333,
        },
        createdAt: '2019-02-15T02:42:21.764Z',
        updatedAt: '2019-02-15T02:50:28.358Z',
        handlers: [
          {
            resourceId: '9ldwPipJc',
            createdAt: '2019-02-15T02:42:21.779Z',
            updatedAt: '2019-02-15T02:50:28.358Z',
            settings: {
              method: 'GET',
              path: '/test',
            },
            actionMappings: {
              input: {
                in1: '=$.content',
              },
              output: {
                code: 200,
                data: '=$.out1',
              },
            },
            outputs: {},
          },
        ],
      },
    ],
    resources: [
      {
        id: '9ldwPipJc',
        name: 'Some flow',
        type: 'flow',
        createdAt: '2019-02-15T02:38:07.333Z',
        updatedAt: null,
        description: '',
        data: {},
      },
      {
        id: '7lfwPqpJd',
        name: 'Some stream',
        type: 'stream',
        description: '',
        data: {},
      },
    ],
  };
}

function getExpectedApp(): FlogoAppModel.App {
  return {
    name: 'my cool app',
    type: 'flogo:app',
    version: '0.0.1',
    appModel: '1.1.0',
    description: 'with a description',
    imports: ['github.com/project-flogo/flow', 'some_path_to_repo/trigger/rest'],
    triggers: [
      {
        id: 'receive_http_message',
        ref: '#rest',
        name: 'Receive HTTP Message',
        description: 'Simple REST Trigger',
        settings: {
          port: 3333,
        },
        handlers: [
          {
            settings: {
              method: 'GET',
              path: '/test',
            },
            action: {
              ref: '#flow',
              settings: {
                resourceId: 'exported=flow:some_flow',
              },
              input: {
                in1: '=$.content',
              },
              output: {
                code: 200,
                data: '=$.out1',
              },
            },
          },
        ],
      },
    ],
    resources: [
      {
        id: 'flow:some_flow',
        data: {
          name: 'Some flow',
        },
      },
      {
        id: 'pipeline:some_stream',
        data: {
          name: 'Some stream',
        },
      },
    ],
  };
}

function getContributionSchemas(): Array<[string, ContributionSchema]> {
  return [
    [
      'some_path_to_repo/trigger/rest',
      {
        name: 'flogo-rest',
        type: ContributionType.Trigger,
        version: '0.0.2',
        ref: 'some_path_to_repo/trigger/rest',
        title: 'Receive HTTP Message',
        description: 'Simple REST Trigger',
        homepage: 'some_path_to_repo/tree/master/trigger/rest',
        settings: [
          {
            name: 'port',
            type: ValueType.Integer,
            required: true,
          },
        ],
        output: [
          {
            name: 'pathParams',
            type: 'params',
          },
          {
            name: 'queryParams',
            type: 'params',
          },
          {
            name: 'headers',
            type: 'params',
          },
          {
            name: 'content',
            type: 'any',
          },
        ],
        reply: [
          {
            name: 'code',
            type: 'int',
          },
          {
            name: 'data',
            type: 'any',
          },
        ],
        handler: {
          settings: [
            {
              name: 'method',
              type: 'string',
              required: true,
              allowed: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            },
            {
              name: 'path',
              type: 'string',
              required: true,
            },
          ],
        },
      } as TriggerSchema,
    ],
  ];
}
