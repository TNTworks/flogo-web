export let mockTrigger = {
  id: 'trigger_request',
  name: 'Trigger Request',
  ref: 'some_path_to_repo/trigger/timer',
  settings: {},
  handlers: [
    {
      settings: {
        repeating: null,
        startDate: null,
        hours: null,
        minutes: '5',
        seconds: null,
      },
      actionId: 'test_flow_1',
    },
  ],
};

export let mockErrorTrigger = {
  id: 'trigger_request',
  name: 'Trigger Request',
  settings: {},
  handlers: [
    {
      settings: {
        repeating: null,
        startDate: null,
        hours: null,
        minutes: '5',
        seconds: null,
      },
      actionId: 'test_flow_1',
    },
  ],
};

export let mockTriggerDetails = {
  id: 'tibco-timer',
  name: 'tibco-timer',
  version: '0.0.1',
  title: 'Timer',
  description: 'Simple Timer trigger',
  homepage: 'some_path_to_repo/tree/master/trigger/timer',
  ref: 'some_path_to_repo/trigger/timer',
  settings: [],
  outputs: [
    {
      name: 'params',
      type: 'params',
    },
    {
      name: 'content',
      type: 'object',
    },
  ],
  handler: {
    settings: [
      {
        name: 'repeating',
        type: 'string',
      },
      {
        name: 'startDate',
        type: 'string',
      },
      {
        name: 'hours',
        type: 'string',
      },
      {
        name: 'minutes',
        type: 'string',
      },
      {
        name: 'seconds',
        type: 'string',
      },
    ],
  },
};
