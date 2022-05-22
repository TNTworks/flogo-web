import { isMapperActivity, isOutputMapperField } from './is-mapper-activity';

describe('utils.isMapperActivity', () => {
  test('It should check if an activity schema represents a mapper activity', () => {
    expect(
      isMapperActivity({
        id: 'github-com-project-flogo-contrib-activity-mapper',
        ref: 'github.com/TNTworks/flogo-contrib/activity/mapper',
        homepage: 'https://github.com/prject-flogo/contrib/tree/master/activity/mapper',
        name: 'flogo-mapper',
        type: 'flogo:activity',
        version: '0.0.2',
        title: 'Mapper',
        description: 'Mapper',
        settings: [
          {
            name: 'mappings',
            type: 'any',
            required: true,
            display: {
              name: 'Mapper',
              type: 'mapper',
              mapperOutputScope: 'action',
            },
          },
        ],
      })
    ).toBeTruthy();

    expect(
      isMapperActivity({
        id: 'github-com-project-flogo-contrib-activity-log',
        ref: 'github.com/TNTworks/flogo-contrib/activity/log',
        homepage: 'https://github.com/TNTworks/flogo-contrib/tree/master/activity/log',
        name: 'flogo-log',
        type: 'flogo:activity',
        version: '0.0.2',
        title: 'Log',
        description: 'Logs a message',
        inputs: [
          {
            name: 'message',
            type: 'string',
            value: 'Hello!!',
          },
          {
            name: 'addDetails',
            type: 'boolean',
            value: false,
          },
        ],
      })
    ).toBeFalsy();
  });
});

describe('utils.isOutputMapperField', () => {
  test('It should check if an input definition is of mapper activity', () => {
    expect(
      isOutputMapperField({
        name: 'mappings',
        type: 'any',
        required: true,
        display: {
          name: 'Mapper',
          type: 'mapper',
          mapperOutputScope: 'action',
        },
      })
    ).toBeTruthy();

    expect(isOutputMapperField({})).toBeFalsy();
  });
});
