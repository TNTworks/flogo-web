import { Resource, CONTRIB_REFS, ContributionType, ValueType } from '@flogo-web/core';
import { createActionImporter } from './create-action-importer';
import { ImportsRefAgent, ImportActionsRegistry } from '@flogo-web/lib-server/core';

const importsRefAgent: ImportsRefAgent = {
  getPackageRef: (type, ref) => ref,
};

const actionsManager: ImportActionsRegistry = {
  getSettingsForResourceId: (id, propName) => null,
  getSettingsForId: id => null,
  getRefForId: id => id,
};

test('It imports an action', () => {
  const actionImporter = createActionImporter();
  const flowResource = getSampleFlowResource();
  const importedFlow = actionImporter.importAction(flowResource, {
    contributions: getContributions(),
    normalizedTriggerIds: new Map(),
    normalizedResourceIds: new Map([['flow:somesubflow', 'updatedSubflowId']]),
    importsRefAgent,
    actionsManager,
  });
  expect(importedFlow).toEqual(expect.objectContaining(getExpectedImport()));
});

test('It errors if an activity is not installed', () => {
  const actionImporter = createActionImporter();
  const flowResource = getSampleFlowResource();
  expect.assertions(1);
  try {
    actionImporter.importAction(flowResource, {
      contributions: new Map<string, any>([[CONTRIB_REFS.SUBFLOW, {}]]),
      normalizedTriggerIds: new Map(),
      normalizedResourceIds: new Map(),
      importsRefAgent,
      actionsManager,
    });
  } catch (e) {
    expect(e).toMatchObject({
      details: {
        errors: [
          {
            keyword: 'activity-installed',
            dataPath: '.data.tasks[0].activity.ref',
          },
          {
            keyword: 'activity-installed',
            dataPath: '.data.tasks[1].activity.ref',
          },
          {
            keyword: 'activity-installed',
            dataPath: '.data.errorHandler.tasks[0].activity.ref',
          },
        ],
      },
    });
  }
});

function getSampleFlowResource(): Resource {
  return {
    id: 'generatedId',
    name: 'GetStatus',
    description: 'A description',
    type: 'flow',
    metadata: {
      input: [
        {
          name: 'id',
          type: ValueType.String,
        },
      ],
      output: [
        {
          name: 'status',
          type: ValueType.Object,
        },
        {
          name: 'code',
          type: ValueType.Integer,
        },
      ],
    },
    data: {
      tasks: [
        {
          id: 'log_1',
          name: 'Log Message',
          description: 'Simple Log Activity',
          activity: {
            ref: 'some_path_to_repo/activity/log',
            input: {},
            settings: {},
            mappings: {
              input: [
                {
                  type: 'literal',
                  value: 'hello',
                  mapTo: 'message',
                },
              ],
            },
          },
        },
        {
          id: 'log_2',
          name: 'Log Message 2',
          description: 'Simple Log Activity 2',
          activity: {
            ref: 'some_path_to_repo/activity/log',
            input: {},
            settings: {},
            mappings: {
              input: [
                {
                  type: 'literal',
                  value: 12345,
                  mapTo: 'message',
                },
              ],
            },
          },
        },
        {
          id: 'subflow_1',
          name: 'Subflow',
          activity: {
            ref: CONTRIB_REFS.SUBFLOW,
            settings: {
              flowURI: 'res://flow:somesubflow',
            },
          },
        },
      ],
      links: [{ from: 'log_1', to: 'log_2' }],
      errorHandler: {
        tasks: [
          {
            id: 'log_6',
            activity: {
              ref: 'some_path_to_repo/activity/log',
              input: {
                message: 'log in error handler',
              },
              settings: {},
              output: {},
              mappings: {},
            },
          },
        ],
      },
    },
  };
}

function getExpectedImport() {
  return {
    id: 'generatedId',
    name: 'GetStatus',
    description: 'A description',
    type: 'flow',
    metadata: {
      input: [
        {
          name: 'id',
          type: 'string',
        },
      ],
      output: [
        {
          name: 'status',
          type: 'object',
        },
        {
          name: 'code',
          type: 'integer',
        },
      ],
    },
    data: {
      tasks: [
        {
          id: 'log_1',
          name: 'Log Message',
          description: 'Simple Log Activity',
          type: 1,
          activityRef: 'some_path_to_repo/activity/log',
          settings: {},
          activitySettings: {},
          inputMappings: {
            message: 'hello',
          },
        },
        {
          id: 'log_2',
          name: 'Log Message 2',
          description: 'Simple Log Activity 2',
          type: 1,
          activityRef: 'some_path_to_repo/activity/log',
          settings: {},
          activitySettings: {},
          inputMappings: {
            message: 12345,
          },
        },
        {
          id: 'subflow_1',
          type: 4,
          name: 'Subflow',
          description: '',
          activityRef: CONTRIB_REFS.SUBFLOW,
          inputMappings: expect.any(Object),
          activitySettings: {},
          settings: {
            flowPath: 'updatedSubflowId',
          },
        },
      ],
      links: [
        {
          id: 0,
          from: 'log_1',
          to: 'log_2',
          type: 0,
        },
      ],
      errorHandler: {
        tasks: [
          {
            id: 'log_6',
            name: 'Log Message',
            description: '',
            type: 1,
            activityRef: 'some_path_to_repo/activity/log',
            settings: {},
            inputMappings: {
              message: 'log in error handler',
            },
            activitySettings: {},
          },
        ],
        links: [],
      },
    },
  };
}

function getContributions() {
  return new Map<string, any>([
    [
      'some_path_to_repo/activity/log',
      {
        name: 'tibco-log',
        type: ContributionType.Activity,
        ref: 'some_path_to_repo/activity/log',
        version: '0.0.1',
        title: 'Log Message',
        description: 'Simple Log Activity',
        homepage: 'some_path_to_repo/tree/master/activity/log',
        input: [
          {
            name: 'message',
            type: 'string',
            value: '',
          },
          {
            name: 'flowInfo',
            type: 'boolean',
            value: false,
          },
          {
            name: 'addToFlow',
            type: 'boolean',
            value: false,
          },
        ],
        output: [
          {
            name: 'message',
            type: 'string',
          },
        ],
      },
    ],
    [CONTRIB_REFS.SUBFLOW, { ref: CONTRIB_REFS.SUBFLOW }],
  ]);
}
