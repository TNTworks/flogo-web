import { ContributionSchema, ContributionType, ValueType } from '@flogo-web/core';
import { FunctionRefFinder } from './function-ref-finder';

test('It finds the functions by name', () => {
  const lookup = new FunctionRefFinder(getTestData());
  expect(lookup.findPackage('number.random')).toEqual(
    'github.com/TNTworks/flogo-contrib/function/number'
  );
  expect(lookup.findPackage('string.equalsIgnoreCase')).toEqual(
    'github.com/TNTworks/flogo-contrib/function/string'
  );
  expect(lookup.findPackage('string.float')).toEqual(
    'github.com/TNTworks/flogo-contrib/function/string'
  );
  expect(() => lookup.findPackage('unknown')).not.toThrow();
});

function getTestData(): ContributionSchema[] {
  return [
    {
      name: 'flogo-timer',
      version: '0.0.2',
      title: 'Timer',
      type: ContributionType.Trigger,
      description: 'Simple Timer trigger',
      homepage: 'https://github.com/TNTworks/flogo-contrib/tree/master/trigger/timer',
      ref: 'github.com/TNTworks/flogo-contrib/trigger/timer',
      handler: {
        settings: [
          {
            name: 'startDelay',
            type: ValueType.String,
          },
          {
            name: 'repeatInterval',
            type: ValueType.String,
          },
        ],
      },
    },
    {
      ref: 'github.com/TNTworks/flogo-contrib/function/number',
      name: 'number',
      type: ContributionType.Function,
      version: '0.0.1',
      title: 'Number Functions',
      description: 'Number Functions',
      homepage: 'https://github.com/prject-flogo/contrib/tree/master/function/number',
      functions: [
        {
          name: 'random',
          description: 'generate a random number',
          varArgs: true,
          args: [
            {
              name: 'limit',
              type: 'int',
            },
          ],
        },
      ],
    },
    {
      ref: 'github.com/TNTworks/flogo-contrib/function/string',
      name: 'string',
      type: ContributionType.Function,
      version: '0.0.1',
      title: 'String Functions',
      description: 'String Functions',
      homepage: 'https://github.com/TNTworks/flogo-contrib/tree/master/function/string',
      functions: [
        {
          name: 'concat',
          description: 'concatenate a set of string',
          varArgs: true,
          args: [
            {
              name: 'str',
              type: 'string',
            },
          ],
        },
        {
          name: 'equals',
          description: 'check if two strings are equal',
          args: [
            {
              name: 'str1',
              type: 'string',
            },
            {
              name: 'str2',
              type: 'string',
            },
          ],
        },
        {
          name: 'equalsIgnoreCase',
          description: 'check if two strings are equal ignoring case',
          args: [
            {
              name: 'str1',
              type: 'string',
            },
            {
              name: 'str2',
              type: 'string',
            },
          ],
        },
        {
          name: 'float',
          description: 'convert the string to a float',
          args: [
            {
              name: 'str1',
              type: 'string',
            },
          ],
        },
        {
          name: 'integer',
          description: 'convert the string to an integer',
          args: [
            {
              name: 'str1',
              type: 'string',
            },
          ],
        },
        {
          name: 'len',
          description: 'get the length of a string',
          args: [
            {
              name: 'str1',
              type: 'string',
            },
          ],
        },
        {
          name: 'substring',
          description: 'get a substring from a string',
          args: [
            {
              name: 'str',
              type: 'string',
            },
            {
              name: 'start',
              type: 'string',
            },
            {
              name: 'end',
              type: 'string',
            },
          ],
        },
      ],
    },
  ];
}
