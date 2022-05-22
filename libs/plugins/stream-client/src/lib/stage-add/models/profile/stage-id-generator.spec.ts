import { stageIdGenerator } from './stage-id-generator';

const mockStagesAvailable = {
  RmxvZ286OlRyaWdnZXI6OjE1MDQ2Mjg3ODI1NzU: {
    name: 'Timer',
    title: 'Timer',
    version: '0.0.1',
    homepage: 'some_path_to_repo/tree/master/trigger/timer',
    description: 'Simple Timer trigger',
    installed: true,
    settings: [],
    outputs: [
      {
        name: 'params',
        type: 6,
        value: null,
      },
      {
        name: 'content',
        type: 4,
        value: null,
      },
    ],
    ref: 'some_path_to_repo/trigger/timer',
    handler: {
      settings: [
        {
          name: 'repeating',
          type: 'string',
          value: '10',
          required: true,
        },
        {
          name: 'notImmediate',
          type: 'string',
          value: null,
        },
        {
          name: 'startDate',
          type: 'string',
          value: null,
        },
        {
          name: 'hours',
          type: 'string',
          value: null,
        },
        {
          name: 'minutes',
          type: 'string',
          value: null,
        },
        {
          name: 'seconds',
          type: 'string',
          value: null,
        },
      ],
    },
    __props: {
      errors: [],
      warnings: [],
      outputs: [
        {
          name: 'params',
          type: 6,
          value: null,
        },
        {
          name: 'content',
          type: 4,
          value: null,
        },
      ],
    },
    __status: {
      isRunning: false,
      hasRun: false,
    },
    id: 'RmxvZ286OlRyaWdnZXI6OjE1MDQ2Mjg3ODI1NzU',
    nodeId: 'RmxvZ286OlRyaWdnZXI6OjE1MDQ2Mjg3ODI1NzU',
    type: 0,
    triggerType: 'tibco-timer',
  },
};
const mockSelectedStage = {
  name: 'tibco-counter',
  version: '0.0.1',
  title: 'Increment Counter',
  description: 'Simple Global Counter Activity',
  ref: 'some_path_to_repo/tree/master/activity/counter',
  inputs: [
    {
      name: 'counterName',
      type: 'string',
      required: true,
    },
    {
      name: 'increment',
      type: 'boolean',
    },
    {
      name: 'reset',
      type: 'boolean',
    },
  ],
  outputs: [
    {
      name: 'value',
      type: 'integer',
    },
  ],
};

describe('stageIdGenerator', () => {
  let generatedStageID;

  it('Should generate the stage ID for Microservice profile in "ref_num" format', () => {
    generatedStageID = stageIdGenerator(mockStagesAvailable, mockSelectedStage);
    expect(generatedStageID).toEqual('counter_2');
  });
});
