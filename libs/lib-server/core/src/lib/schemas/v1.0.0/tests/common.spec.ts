import { makeAjvContext } from './test-utils';

const commonSchema = require('../common.json');

describe('JSONSchema: Common', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    testContext.ajvContext = makeAjvContext('common', [commonSchema]);
  });

  describe('types', () => {
    const tests = ['valueType', 'mappingType'];
    tests.forEach(defName => {
      test(`#/definitions/${defName} rejects unknown types`, () => {
        const validateValueType = testContext.ajvContext.compileDefinitionSubschema(
          defName
        );
        const isValid = validateValueType('somethingelse');
        expect(isValid).toBe(false);
      });
    });
  });

  describe('#/definitions/mapping', () => {
    let isValidMapping;

    beforeEach(() => {
      isValidMapping = testContext.ajvContext.compileDefinitionSubschema('mapping');
    });

    test('should allow correct mappings', () => {
      expect(
        isValidMapping({
          type: 'literal',
          mapTo: 'someProp',
          value: 4,
        })
      ).toBe(true);
    });

    test('should reject incomplete mappings', () => {
      const incompleteMappings = [
        {},
        { type: 'string' },
        { type: '', mapTo: '', value: null },
        { type: 'expression', mapTo: 3, value: null },
      ];
      incompleteMappings.forEach((mapping, i) =>
        expect(isValidMapping(mapping)).toBe(false)
      );
    });
  });

  describe('#/definitions/mappingsCollection', () => {
    let validate;

    beforeEach(() => {
      validate = testContext.ajvContext.compileDefinitionSubschema('mappingsCollection');
    });

    test('should allow correct mappings', () => {
      expect(
        validate([
          { type: 'literal', mapTo: 'someProp', value: 5 },
          { type: 'expression', mapTo: 'someOtherProp', value: 'somexpr' },
        ])
      ).toBe(true);
    });

    test('should reject incorrect mappings', () => {
      expect(
        validate([
          { type: 'expression', mapTo: 'someProp', value: 'someexpr' },
          { im: 'incorrect' },
        ])
      ).toBe(false);
    });

    test('should accept empty collections', () => {
      expect(validate([])).toBe(true);
    });
  });

  describe('#/definitions/metadataItem', () => {
    let metadataItemValidator;
    beforeEach(() => {
      metadataItemValidator = testContext.ajvContext.createValidatorForSubschema(
        'metadataItem'
      );
    });

    test('should allow correct metadata items', () => {
      metadataItemValidator
        .validateAndCreateAsserter({ name: 'sampleMetadata', type: 'string' })
        .assertIsValid();
    });

    test('should require name', () => {
      metadataItemValidator
        .validateAndCreateAsserter({ type: 'number' })
        .assertIsInvalid()
        .assertHasErrorForRequiredProp('name');
    });

    test('should not allow empty name', () => {
      metadataItemValidator
        .validateAndCreateAsserter({ name: '', type: 'number' })
        .assertIsInvalid()
        .assertHasErrorForEmptyProp('name');
    });

    test('should require type', () => {
      metadataItemValidator
        .validateAndCreateAsserter({ name: 'myProp' })
        .assertIsInvalid()
        .assertHasErrorForRequiredProp('type');
    });
  });

  describe('#/definitions/metadata', () => {
    let metadataValidator;
    const metadataItem = { name: 'sampleMetadata', type: 'string' };
    const metadata = {
      input: [{ ...metadataItem }],
      output: [{ ...metadataItem }],
    };
    beforeEach(() => {
      metadataValidator = testContext.ajvContext.createValidatorForSubschema('metadata');
    });

    test('should accept input mappings', () => {
      const action = { input: [{ ...metadataItem }] };
      expect(metadataValidator.validate(action)).toBe(true);
    });

    test('should accept output mappings', () => {
      const action = { output: [{ ...metadataItem }] };
      expect(metadataValidator.validate(action)).toBe(true);
    });

    test('should accept both input and output mappings', () => {
      const action = { ...metadata };
      expect(metadataValidator.validate(action)).toBe(true);
    });
  });
});
