import { cloneDeep } from 'lodash';

import { makeAjvContext } from './test-utils';

const commonSchema = require('../common.json');
const flowSchema = require('../flow.json');

describe('JSONSchema: Flow', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  const validSchemas = generateValidSchemas();

  beforeEach(() => {
    testContext.ajvContext = makeAjvContext('flow', [commonSchema, flowSchema], {
      removeAdditional: true,
    });
    testContext.validator = testContext.ajvContext.createValidator();
  });

  test('should allow correct flows', () => {
    const flow = {
      name: 'my cool flow',
      description: 'this is a flow description',
      metadata: { ...validSchemas.metadata },
      tasks: [{ ...validSchemas.task }],
      links: [{ ...validSchemas.link }],
      errorHandler: {
        tasks: [{ ...validSchemas.task }],
        links: [{ ...validSchemas.link }],
      },
    };
    const flowUnderTest = cloneDeep(flow);
    const isValid = testContext.ajvContext.validate(flowUnderTest);
    expect(isValid).toBe(true);
    expect(flowUnderTest).toMatchObject(flow);
  });

  describe('#/definitions', () => {
    describe('/activity', () => {
      let activityValidator;
      beforeEach(() => {
        activityValidator = testContext.ajvContext.createValidatorForSubschema(
          'activity'
        );
      });
      test('should allow correct activities', () => {
        activityValidator
          .validateAndCreateAsserter({ ...validSchemas.activity })
          .assertIsValid();
      });
      test('should require ref', () => {
        activityValidator
          .validateAndCreateAsserter({ type: 'number' })
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('ref');
      });

      test('should require settings when activity is subflow', () => {
        const activityUnderTest = { ...validSchemas.activity };
        activityUnderTest.ref = 'github.com/TIBCOSoftware/flogo-contrib/activity/subflow';
        activityUnderTest.settings = {};
        activityValidator
          .validateAndCreateAsserter(activityUnderTest)
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('.flowURI');
      });

      test('should have valid flowURI in case of subflow', () => {
        const activityUnderTest = { ...validSchemas.activity };
        activityUnderTest.ref = 'github.com/project-flogo/flow/activity/subflow';
        activityUnderTest.settings = { flowURI: 'flowUri' };
        activityValidator
          .validateAndCreateAsserter(activityUnderTest)
          .assertIsInvalid()
          .assertHasErrorForMismatchingPattern('settings.flowURI');
      });
    });

    describe('/task', () => {
      let taskValidator;
      beforeEach(() => {
        taskValidator = testContext.ajvContext.createValidatorForSubschema('task');
      });

      test('should allow correct tasks', () => {
        const settings = {
          iterate: '$someref',
          customSettings: 'foobar',
        };
        const originalTask = { ...validSchemas.task, settings };
        const taskUnderTest = cloneDeep(originalTask);
        taskValidator.validate(taskUnderTest);
        expect(taskUnderTest).toMatchObject(originalTask);
      });

      ['id', 'activity'].forEach(requiredProp => {
        test(`should require ${requiredProp}`, () => {
          const taskUnderTest = { ...validSchemas.task };
          delete taskUnderTest[requiredProp];
          taskValidator
            .validateAndCreateAsserter(taskUnderTest)
            .assertIsInvalid()
            .assertHasErrorForRequiredProp(requiredProp);
        });
      });

      test('should not allow empty id', () => {
        taskValidator
          .validateAndCreateAsserter({ ...validSchemas.task, id: '' })
          .assertIsInvalid()
          .assertHasErrorForEmptyProp('id');
      });
    });

    describe('/link', () => {
      let linkValidator;
      beforeEach(() => {
        linkValidator = testContext.ajvContext.createValidatorForSubschema('link');
      });
      test('should allow correct links', () => {
        linkValidator.validateAndCreateAsserter({ ...validSchemas.link }).assertIsValid();
      });
      ['from', 'to'].forEach(propName => {
        test(`should require "${propName}" property`, () => {
          const linkUnderTest = { ...validSchemas.link };
          delete linkUnderTest[propName];
          linkValidator
            .validateAndCreateAsserter(linkUnderTest)
            .assertIsInvalid()
            .assertHasErrorForRequiredProp(propName);
        });
      });
      test('should allow value when type expression', () => {
        const linkUnderTest = { ...validSchemas.link };
        linkUnderTest.type = 'expression';
        linkValidator
          .validateAndCreateAsserter(linkUnderTest)
          .assertIsInvalid()
          .assertHasErrorForRequiredProp('.value');
      });

      test('should not accept invalid type', () => {
        const linkUnderTest = { ...validSchemas.link };
        const allowedValues = ['default', 'dependency', 'expression'];
        linkUnderTest.type = 'somethingElse';
        linkValidator
          .validateAndCreateAsserter(linkUnderTest)
          .assertIsInvalid()
          .assertHasErrorForMismatchingPropertyEnum('type', allowedValues);
      });
    });
  });

  function generateValidSchemas() {
    const link: { [linkProp: string]: any } = { from: 'task_a', to: 'task_b' };
    const metadataItem = { name: 'sampleMetadata', type: 'string' };
    const metadata = {
      input: [{ ...metadataItem }],
      output: [{ ...metadataItem }],
    };
    const activity: { [schemaProp: string]: any } = {
      ref: 'github.com/flogo-contrib/activity/log',
    };
    const task = {
      id: 'task_a',
      activity: { ...activity },
    };

    return {
      link,
      metadata,
      metadataItem,
      task,
      activity,
    };
  }
});
