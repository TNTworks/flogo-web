import { makeAjvContext } from './test-utils';

const triggerSchema = require('../trigger.json');
const commonSchema = require('../common.json');

describe('JSONSchema: Trigger', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  const validFlowData = { flowURI: 'res://flow:example' };
  const validMapping = { someProp: 5 };
  const actionWithoutMappings = {
    ref: 'github.com/project-flogo/flow',
    data: { ...validFlowData },
  };
  const validAction = {
    ...actionWithoutMappings,
    input: { ...validMapping },
    output: { ...validMapping },
  };
  const validTrigger = {
    id: 'handlerId',
    ref: 'some_path_to_repo/trigger/timer',
    handlers: [{ action: { ...validAction } }],
  };

  beforeEach(() => {
    testContext.ajvContext = makeAjvContext('trigger', [commonSchema, triggerSchema]);
  });

  ['id', 'ref'].forEach(propName => {
    test(`should require "${propName}" property`, () => {
      const triggerUnderTest = { ...validTrigger };
      delete triggerUnderTest[propName];
      testContext.ajvContext
        .createValidator()
        .validateAndCreateAsserter(triggerUnderTest)
        .assertIsInvalid()
        .assertHasErrorForRequiredProp(propName);
    });
  });

  test('should allow correct triggers', () => {
    const isValid = testContext.ajvContext.validate(validTrigger);
    expect(isValid).toBe(true);
  });

  test('handlers should be an array', () => {
    const triggerUnderTest = { ...validTrigger, handlers: {} };
    testContext.ajvContext
      .createValidator()
      .validateAndCreateAsserter(triggerUnderTest)
      .assertIsInvalid()
      .assertHasErrorForMismatchingPropertyType('handlers', 'array');
  });

  describe('#/definitions', () => {
    describe('/flowData', () => {
      let validate;
      beforeEach(() => {
        validate = testContext.ajvContext.compileDefinitionSubschema('flowData');
      });

      test('should not allow empty refs', () => {
        expect(validate({})).toBe(false);
        expect(validate(null)).toBe(false);
      });

      test('flowURI is required', () => {
        expect(validate({ flowURI: '' })).toBe(false);
        expect(validate({ flowURI: null })).toBe(false);
      });

      test('should allow correct values', () => {
        expect(validate({ flowURI: 'res://flow:example' })).toBe(true);
      });
    });

    describe('/action', () => {
      let validator;

      beforeEach(() => {
        validator = testContext.ajvContext.createValidatorForSubschema('action');
      });

      test('should accept data property', () => {
        expect(
          validator.validate({
            ref: 'github.com/project-flogo/flow',
            data: {},
          })
        ).toBeTruthy();
      });

      test('should accept settings property', () => {
        expect(
          validator.validate({
            ref: 'github.com/project-flogo/flow',
            settings: {},
          })
        ).toBeTruthy();
      });

      test('should error if data nor settings are present', () => {
        expect.assertions(3);
        expect(
          validator.validate({
            ref: 'github.com/project-flogo/flow',
          })
        ).toBeFalsy();
        validator
          .createAsserter()
          .assertHasErrorForRequiredProp('.data')
          .assertHasErrorForRequiredProp('.settings');
      });

      test('should accept data property', () => {
        expect(
          validator.validate({
            ...actionWithoutMappings,
            data: {},
          })
        ).toBeTruthy();
      });

      test('should accept input mappings', () => {
        const action = {
          ...actionWithoutMappings,
          input: { ...validMapping },
        };
        expect(validator.validate(action)).toBe(true);
      });

      test('should accept output mappings', () => {
        const action = {
          ...actionWithoutMappings,
          output: { ...validMapping },
        };
        expect(validator.validate(action)).toBe(true);
      });

      test('should accept both input and output mappings', () => {
        const action = { ...validAction };
        expect(validator.validate(action)).toBe(true);
      });
    });

    describe('/handler', () => {
      let validator;
      beforeEach(() => {
        validator = testContext.ajvContext.createValidatorForSubschema('handler');
      });

      test('should require action', () => {
        validator
          .validateAndCreateAsserter({ settings: {} })
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('action');
      });

      test('should accept empty settings', () => {
        const isValid = validator.validate({
          action: { ...validAction },
          settings: {},
        });
        expect(isValid).toBe(true);
      });

      test('should accept any settings', () => {
        const isValid = validator.validate({
          action: { ...validAction },
          settings: {
            a: 1,
            b: 'xyz',
            c: { foo: 'bar' },
          },
        });
        expect(isValid).toBe(true);
      });

      test('when using removeAdditional option all settings should be preserved', () => {
        const validateAndRemoveAdditional = testContext.ajvContext
          .cloneContext({ removeAdditional: true })
          .compileDefinitionSubschema('handler');
        const settings = {
          a: 1,
          b: 'xyz',
          c: { foo: 'bar' },
        };
        const actionUnderTest = {
          action: { ...validAction },
          unknownProp: 22,
          settings: { ...settings },
        };
        const isValid = validateAndRemoveAdditional(actionUnderTest);
        expect(isValid).toBe(true);
        expect(actionUnderTest).not.toHaveProperty('unknownProp');
        expect(actionUnderTest.settings).toMatchObject(settings);
      });
    });
  });
});
