import { activitySchemaToTask } from './task-factories';

describe('Function: activitySchemaToTask', function() {
  const schemasUnderTest = {
    normal: {
      inputs: [
        {
          name: 'flowInfo',
          type: 'boolean',
          value: 'false',
        },
        {
          name: 'addToFlow',
          type: 'boolean',
        },
      ],
    },
    mapper: {
      settings: [
        {
          name: 'mappings',
          type: 'array',
          required: true,
          display: {
            name: 'Mapper',
            type: 'mapper',
            mapperOutputScope: 'action',
          },
        },
      ],
    },
  };

  it('Should create configurations for inputs with default values for normal activities', () => {
    const normalTask = activitySchemaToTask(schemasUnderTest.normal);
    expect(normalTask.inputMappings).toBeDefined();
    expect(normalTask.inputMappings).toEqual({
      flowInfo: 'false',
    });
  });

  it('Should not create configurations for inputs for normal activities', () => {
    expect(activitySchemaToTask(schemasUnderTest.mapper).inputMappings).toBeUndefined();
  });
});
