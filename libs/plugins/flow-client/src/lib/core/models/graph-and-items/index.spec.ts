import { ContributionSchema } from '@flogo-web/core';
import { Dictionary, FlowGraph, GraphNode, NodeType } from '@flogo-web/lib-client/core';
import { ObjectSlice } from '@flogo-web/lib-client/core/testing';
import { makeGraphAndItems } from '.';
import { Item } from '../../interfaces';
import { FLOGO_TASK_TYPE } from '../../constants';

describe('flow.core.models.graph-and-items', function() {
  const tasks = [
    {
      id: 'log_1',
      name: 'Start processing',
      description: 'Simple Log Activity',
      type: 1,
      activityType: 'github-com-tibco-software-flogo-contrib-activity-log',
      activityRef: 'some_path_to_repo/activity/log',
      attributes: [
        {
          name: 'message',
          value: 'Received Rest request and starting trigger',
          required: false,
          type: 'string',
        },
        {
          name: 'flowInfo',
          value: 'true',
          required: false,
          type: 'boolean',
        },
        {
          name: 'addToFlow',
          value: 'true',
          required: false,
          type: 'boolean',
        },
      ],
    },
    {
      id: 'awsiot_1',
      name: 'Update',
      description: 'Simple AWS IoT',
      type: 1,
      activityType: 'github-com-tibco-software-flogo-contrib-activity-awsiot',
      activityRef: 'some_path_to_repo/activity/awsiot',
      attributes: [
        {
          name: 'thingName',
          value: 'flogo_test',
          required: false,
          type: 'string',
        },
        {
          name: 'awsEndpoint',
          value: 'a1njsonnibpa75.iot.us-east-1.amazonaws.com',
          required: false,
          type: 'string',
        },
        {
          name: 'desired',
          value: {
            switch: 'on',
          },
          required: false,
          type: 'params',
        },
        {
          name: 'reported',
          value: {
            switch: 'off',
          },
          required: false,
          type: 'params',
        },
      ],
    },
    {
      id: 'reply_1',
      name: 'Done',
      description: 'Simple Reply Activity',
      type: 1,
      activityType: 'github-com-tibco-software-flogo-contrib-activity-reply',
      activityRef: 'some_path_to_repo/activity/reply',
      attributes: [
        {
          name: 'code',
          value: '200',
          required: false,
          type: 'integer',
        },
        {
          name: 'data',
          value: 'AWS IOT update successfully',
          required: false,
          type: 'any',
        },
      ],
    },
    {
      id: 'log_6',
      name: 'Log Message (3)',
      description: 'Simple Log Activity',
      type: 1,
      activityType: 'tibco-log',
      activityRef: 'some_path_to_repo/activity/log',
      attributes: [
        {
          name: 'message',
          value: '',
          required: false,
          type: 'string',
        },
        {
          name: 'flowInfo',
          value: 'false',
          required: false,
          type: 'boolean',
        },
        {
          name: 'addToFlow',
          value: 'false',
          required: false,
          type: 'boolean',
        },
      ],
    },
    {
      id: 'log_7',
      name: 'Log Message (4)',
      description: 'Simple Log Activity',
      type: 1,
      activityType: 'tibco-log',
      activityRef: 'some_path_to_repo/activity/log',
      attributes: [
        {
          name: 'message',
          value: '',
          required: false,
          type: 'string',
        },
        {
          name: 'flowInfo',
          value: 'false',
          required: false,
          type: 'boolean',
        },
        {
          name: 'addToFlow',
          value: 'false',
          required: false,
          type: 'boolean',
        },
      ],
    },
    {
      id: 'log_4',
      name: 'Log Message',
      description: 'Simple Log Activity',
      type: 1,
      activityType: 'tibco-log',
      activityRef: 'some_path_to_repo/activity/log',
      attributes: [
        {
          name: 'message',
          value: '',
          required: false,
          type: 'string',
        },
        {
          name: 'flowInfo',
          value: 'false',
          required: false,
          type: 'boolean',
        },
        {
          name: 'addToFlow',
          value: 'false',
          required: false,
          type: 'boolean',
        },
      ],
    },
    {
      id: 'log_5',
      name: 'Log Message (2)',
      description: 'Simple Log Activity',
      type: 1,
      activityType: 'tibco-log',
      activityRef: 'some_path_to_repo/activity/log',
      attributes: [
        {
          name: 'message',
          value: '',
          required: false,
          type: 'string',
        },
        {
          name: 'flowInfo',
          value: 'false',
          required: false,
          type: 'boolean',
        },
        {
          name: 'addToFlow',
          value: 'false',
          required: false,
          type: 'boolean',
        },
      ],
    },
  ];
  const links = [
    {
      id: 1,
      from: 'log_1',
      to: 'awsiot_1',
      type: 0,
    },
    {
      id: 2,
      from: 'awsiot_1',
      to: 'reply_1',
      type: 0,
    },
    {
      id: 3,
      from: 'reply_1',
      to: 'log_6',
      type: 1,
      value: 'true',
    },
    {
      id: 4,
      from: 'log_6',
      to: 'log_7',
      type: 1,
      value: 'true',
    },
    {
      id: 5,
      from: 'awsiot_1',
      to: 'log_4',
      type: 1,
      value: 'true',
    },
    {
      id: 6,
      from: 'awsiot_1',
      to: 'log_5',
      type: 1,
      value: 'true',
    },
  ];

  const mockSchemas = [
    { ref: 'some_path_to_repo/activity/log' },
    { ref: 'some_path_to_repo/activity/reply' },
    { ref: 'some_path_to_repo/activity/awsiot' },
  ];

  let graph: FlowGraph;
  let items: Dictionary<Item>;

  beforeAll(function() {
    let branchId = 1;
    const graphAndItems = makeGraphAndItems(
      tasks,
      links,
      <ContributionSchema[]>mockSchemas,
      () => `dummy_branch_${branchId++}`
    );
    graph = graphAndItems.graph;
    items = graphAndItems.items;
  });

  it('should correctly form the items from the flow info', function() {
    expect(items).toEqual({
      log_1: {
        name: 'Start processing',
        description: 'Simple Log Activity',
        settings: {},
        ref: 'some_path_to_repo/activity/log',
        id: 'log_1',
        inputMappings: {},
        activitySettings: {},
        type: FLOGO_TASK_TYPE.TASK,
        return: false,
        input: {
          message: 'Received Rest request and starting trigger',
          flowInfo: 'true',
          addToFlow: 'true',
        },
      },
      awsiot_1: {
        name: 'Update',
        description: 'Simple AWS IoT',
        settings: {},
        ref: 'some_path_to_repo/activity/awsiot',
        id: 'awsiot_1',
        inputMappings: {},
        activitySettings: {},
        type: FLOGO_TASK_TYPE.TASK,
        return: false,
        input: {
          thingName: 'flogo_test',
          awsEndpoint: 'a1njsonnibpa75.iot.us-east-1.amazonaws.com',
          desired: {
            switch: 'on',
          },
          reported: {
            switch: 'off',
          },
        },
      },
      reply_1: {
        name: 'Done',
        description: 'Simple Reply Activity',
        settings: {},
        ref: 'some_path_to_repo/activity/reply',
        id: 'reply_1',
        inputMappings: {},
        activitySettings: {},
        type: FLOGO_TASK_TYPE.TASK,
        return: false,
        input: {
          code: '200',
          data: 'AWS IOT update successfully',
        },
      },
      log_6: {
        name: 'Log Message (3)',
        description: 'Simple Log Activity',
        settings: {},
        ref: 'some_path_to_repo/activity/log',
        id: 'log_6',
        inputMappings: {},
        activitySettings: {},
        type: FLOGO_TASK_TYPE.TASK,
        return: false,
        input: {
          message: '',
          flowInfo: 'false',
          addToFlow: 'false',
        },
      },
      log_7: {
        name: 'Log Message (4)',
        description: 'Simple Log Activity',
        settings: {},
        ref: 'some_path_to_repo/activity/log',
        id: 'log_7',
        inputMappings: {},
        activitySettings: {},
        type: FLOGO_TASK_TYPE.TASK,
        return: false,
        input: {
          message: '',
          flowInfo: 'false',
          addToFlow: 'false',
        },
      },
      log_4: {
        name: 'Log Message',
        description: 'Simple Log Activity',
        settings: {},
        ref: 'some_path_to_repo/activity/log',
        id: 'log_4',
        inputMappings: {},
        activitySettings: {},
        type: 1,
        return: false,
        input: {
          message: '',
          flowInfo: 'false',
          addToFlow: 'false',
        },
      },
      log_5: {
        name: 'Log Message (2)',
        description: 'Simple Log Activity',
        settings: {},
        ref: 'some_path_to_repo/activity/log',
        id: 'log_5',
        inputMappings: {},
        activitySettings: {},
        type: FLOGO_TASK_TYPE.TASK,
        return: false,
        input: {
          message: '',
          flowInfo: 'false',
          addToFlow: 'false',
        },
      },
      dummy_branch_1: {
        id: 'dummy_branch_1',
        type: FLOGO_TASK_TYPE.TASK_BRANCH,
        condition: 'true',
      },
      dummy_branch_2: {
        id: 'dummy_branch_2',
        type: FLOGO_TASK_TYPE.TASK_BRANCH,
        condition: 'true',
      },
      dummy_branch_3: {
        id: 'dummy_branch_3',
        type: FLOGO_TASK_TYPE.TASK_BRANCH,
        condition: 'true',
      },
      dummy_branch_4: {
        id: 'dummy_branch_4',
        type: FLOGO_TASK_TYPE.TASK_BRANCH,
        condition: 'true',
      },
    });
  });

  it('should correctly form a flow graph from the flow info', function() {
    type NodeSlice = ObjectSlice<GraphNode>;
    type PartialNodeDict = Dictionary<NodeSlice | jasmine.ObjectContaining<NodeSlice>>;

    expect(graph.rootId).toEqual('log_1');
    expect<PartialNodeDict>(graph.nodes).toEqual({
      log_1: {
        title: 'Start processing',
        description: 'Simple Log Activity',
        type: NodeType.Task,
        id: 'log_1',
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false,
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false,
        },
        children: ['awsiot_1'],
        parents: [],
      },
      awsiot_1: {
        title: 'Update',
        description: 'Simple AWS IoT',
        type: NodeType.Task,
        id: 'awsiot_1',
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false,
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false,
        },
        children: ['reply_1', 'dummy_branch_3', 'dummy_branch_4'],
        parents: ['log_1'],
      },
      reply_1: {
        title: 'Done',
        description: 'Simple Reply Activity',
        type: NodeType.Task,
        id: 'reply_1',
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false,
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false,
        },
        parents: ['awsiot_1'],
        children: ['dummy_branch_1'],
      },
      log_6: {
        title: 'Log Message (3)',
        description: 'Simple Log Activity',
        type: NodeType.Task,
        id: 'log_6',
        parents: ['dummy_branch_1'],
        children: ['dummy_branch_2'],
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false,
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false,
        },
      },
      log_7: {
        title: 'Log Message (4)',
        description: 'Simple Log Activity',
        type: NodeType.Task,
        id: 'log_7',
        parents: ['dummy_branch_2'],
        children: [],
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false,
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false,
        },
      },
      log_4: {
        title: 'Log Message',
        description: 'Simple Log Activity',
        type: NodeType.Task,
        id: 'log_4',
        parents: ['dummy_branch_3'],
        children: [],
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false,
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false,
        },
      },
      log_5: {
        title: 'Log Message (2)',
        description: 'Simple Log Activity',
        type: NodeType.Task,
        id: 'log_5',
        parents: ['dummy_branch_4'],
        children: [],
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false,
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false,
        },
      },
      dummy_branch_1: {
        id: 'dummy_branch_1',
        type: NodeType.Branch,
        parents: ['reply_1'],
        children: ['log_6'],
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false,
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false,
          isBranchConfigured: false,
        },
      },
      dummy_branch_2: {
        id: 'dummy_branch_2',
        type: NodeType.Branch,
        parents: ['log_6'],
        children: ['log_7'],
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false,
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false,
          isBranchConfigured: false,
        },
      },
      dummy_branch_3: {
        id: 'dummy_branch_3',
        type: NodeType.Branch,
        parents: ['awsiot_1'],
        children: ['log_4'],
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false,
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false,
          isBranchConfigured: false,
        },
      },
      dummy_branch_4: {
        id: 'dummy_branch_4',
        type: NodeType.Branch,
        parents: ['awsiot_1'],
        children: ['log_5'],
        features: {
          selectable: true,
          canHaveChildren: true,
          canBranch: true,
          deletable: true,
          subflow: false,
          final: false,
        },
        status: {
          invalid: false,
          executed: false,
          executionErrored: null,
          iterable: false,
          isBranchConfigured: false,
        },
      },
    });
  });
});
