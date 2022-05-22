import { activitySchemaToStage } from './stage-factories';

describe('Function: activitySchemaToStage', function() {
  const schemasUnderTest = {
    normal: {
      inputs: [
        {
          name: 'info',
          type: 'boolean',
          value: 'false',
        },
        {
          name: 'addToResource',
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
    const normalStage = activitySchemaToStage(schemasUnderTest.normal);
    expect(normalStage.inputMappings).toBeDefined();
    expect(normalStage.inputMappings).toEqual({
      info: 'false',
    });
  });

  it('Should not create configurations for inputs for normal activities', () => {
    expect(activitySchemaToStage(schemasUnderTest.mapper).inputMappings).toBeUndefined();
  });
});
