import { cloneDeep } from 'lodash';

import { actionValueTypesNormalizer } from './action-value-type-normalizer';

describe('importer.common.actionValueTypesNormalizer', () => {
  const actionUnderTest = {
    metadata: {
      input: [
        { name: 'in1', type: 'any' },
        { name: 'in2', type: 'integer' },
        { name: 'in3', type: 'string' },
      ],
      output: [
        { name: 'out1', type: 'int' },
        { name: 'out2', type: 'long' },
      ],
    },
    tasks: [
      {
        id: 'task1',
        attributes: [{ name: 'attr1', type: 'double' }],
      },
      {
        id: 'task2',
        attributes: [
          { name: 'attr1', type: 'number' },
          { name: 'attr2', type: 'uknowntype' },
        ],
      },
    ],
    errorHandler: {
      tasks: [
        {
          id: 'task_error',
          attributes: [
            { name: 'attr1', type: 'array' },
            { name: 'attr2', type: 'params' },
            { name: 'attr3', type: 'int' },
          ],
        },
      ],
    },
  };
  const extractValues = arr => arr.map(({ name, type }) => ({ [name]: type }));
  let normalizedAction;

  beforeAll(function() {
    normalizedAction = actionValueTypesNormalizer(cloneDeep(actionUnderTest));
  });

  test('should correctly normalize metadata inputs and outputs', () => {
    const inputs = extractValues(normalizedAction.metadata.input);
    const outputs = extractValues(normalizedAction.metadata.output);
    expect(inputs).toEqual(
      expect.arrayContaining([{ in1: 'any' }, { in2: 'integer' }, { in3: 'string' }])
    );
    expect(outputs).toEqual(
      expect.arrayContaining([{ out1: 'integer' }, { out2: 'long' }])
    );
  });
});
