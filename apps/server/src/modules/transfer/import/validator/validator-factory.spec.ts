import { validatorFactory } from './validator-factory';

describe('importer.validator-factory', () => {
  let validator;
  const refCases = new Map().set('ref/to/a/trigger', 'ref/to/a/trigger');

  beforeEach(() => {
    validator = validatorFactory(makeTestSchema(), ['ref/to/a/trigger'], null, {
      getPackageRef(contribType, aliasRef: string) {
        return refCases.get(aliasRef);
      },
    });
  });

  test('should error for not installed contributions', () => {
    let thrownError;
    try {
      validator.validate({
        trigger: 'foo',
      });
    } catch (error) {
      thrownError = error;
    }
    expect(!!thrownError).toBe(true);

    const validationDetails = thrownError.details.errors;
    expect(Object.keys(validationDetails)).not.toHaveLength(0);

    expect(validationDetails[0]).toMatchObject({
      dataPath: '.trigger',
      keyword: 'trigger-installed',
      params: { ref: 'foo' },
    });
  });

  test('should allow installed contributions', () => {
    expect(() =>
      validator.validate({
        trigger: 'ref/to/a/trigger',
      })
    ).not.toThrowError();
  });

  function makeTestSchema() {
    return {
      type: 'object',
      properties: {
        trigger: {
          type: 'string',
          'trigger-installed': true,
        },
      },
    };
  }
});
