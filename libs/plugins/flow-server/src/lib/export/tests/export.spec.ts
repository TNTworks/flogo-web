import {
  Resource,
  ContributionSchema,
  FlogoAppModel,
  CONTRIB_REFS,
  ContributionType,
  ValueType,
} from '@flogo-web/core';
import {
  FLOGO_TASK_TYPE,
  FlowResourceModel,
  FlowData,
} from '@flogo-web/plugins/flow-core';
import { exportFlow } from '..';

test('it exports a flow', () => {
  const exported = exportFlow(getFlowToExport(), {
    contributions: new Map<string, ContributionSchema>(getContributions()),
    resourceIdReconciler: new Map<string, Resource>([
      ['4ut01d', { id: 'flow:humanized_subflow_ref' } as Resource],
    ]),
    refAgent: {
      getAliasRef: (type, ref): string => ref,
      registerFunctionName: () => {},
    },
    actionAgent: {
      getActionId: resourceId => resourceId,
      registerAction: (ref, id, {}) => {},
    },
  });
  expect(exported).toEqual(getExpectedFlow());
});

function getExpectedFlow(): FlogoAppModel.Resource<FlowResourceModel.FlowResourceData> {
  return {
    id: 'flow:flow_to_export',
    data: {
      name: 'flow to export',
      description: 'some description',
      metadata: {
        input: [{ name: 'in1', type: 'string' }],
        output: [{ name: 'out1', type: 'string' }],
      },
      tasks: [
        {
          id: 'log_2',
          name: 'Log',
          description: 'Logs a message',
          activity: {
            ref: 'some_path_to_repo/activity/log',
            input: {
              message: 'hello world',
              addDetails: false,
            },
          },
        },
        {
          id: 'subflow_3',
          name: 'Start a SubFlow',
          description: 'Activity to start a sub-flow in an existing flow',
          activity: {
            ref: CONTRIB_REFS.SUBFLOW,
            settings: {
              flowURI: 'res://flow:humanized_subflow_ref',
            },
          },
        },
      ],
      links: [
        {
          from: 'log_2',
          to: 'subflow_3',
        },
      ],
      errorHandler: {
        tasks: [
          {
            id: 'error_log',
            name: 'Log',
            description: 'Logs a message',
            activity: {
              ref: 'some_path_to_repo/activity/log',
              input: {
                message: 'hello world from the error handler',
                addDetails: true,
              },
            },
          },
        ],
      },
    },
  };
}

function getFlowToExport(): Resource<FlowData> {
  return {
    id: 'flow:flow_to_export',
    name: 'flow to export',
    description: 'some description',
    createdAt: '2018-10-05T14:48:00.000Z',
    updatedAt: '2018-10-05T14:48:00.000Z',
    metadata: {
      input: [{ name: 'in1', type: ValueType.String, value: null }],
      output: [{ name: 'out1', type: ValueType.String, value: null }],
    },
    type: 'flow',
    data: {
      tasks: [
        {
          id: 'log_2',
          name: 'Log',
          description: 'Logs a message',
          type: 1,
          activityRef: 'some_path_to_repo/activity/log',
          inputMappings: {
            message: 'hello world',
            addDetails: false,
          },
        },
        {
          id: 'subflow_3',
          name: 'Start a SubFlow',
          description: 'Activity to start a sub-flow in an existing flow',
          type: FLOGO_TASK_TYPE.TASK_SUB_PROC,
          activityRef: CONTRIB_REFS.SUBFLOW,
          settings: {
            flowPath: '4ut01d',
          },
        },
      ],
      links: [{ id: '1', from: 'log_2', to: 'subflow_3' }],
      errorHandler: {
        tasks: [
          {
            id: 'error_log',
            name: 'Log',
            description: 'Logs a message',
            type: 1,
            activityRef: 'some_path_to_repo/activity/log',
            inputMappings: {
              message: 'hello world from the error handler',
              addDetails: true,
            },
          },
        ],
      },
    },
  };
}

function getContributions(): Array<[string, ContributionSchema]> {
  return [
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
            type: ValueType.Boolean,
            value: '',
          },
          {
            name: 'addDetails',
            type: ValueType.Boolean,
            value: false,
          },
        ],
        output: [
          {
            name: 'message',
            type: ValueType.String,
          },
        ],
      },
    ],
    [
      CONTRIB_REFS.SUBFLOW,
      {
        ref: 'github.com/project-flogo/flow/activity/subflow',
        homepage: 'https://github.com/project-flogo/flow/tree/master/activity/subflow',
        name: 'flogo-subflow',
        type: ContributionType.Activity,
        version: '0.9.0',
        title: 'Start a SubFlow',
        description: 'Activity to start a sub-flow in an existing flow',
        settings: [
          {
            name: 'flowURI',
            type: ValueType.String,
            required: true,
          },
        ],
      },
    ],
  ];
}
