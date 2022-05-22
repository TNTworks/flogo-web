import Ajv = require('ajv');
import { SCHEMA_NAMESPACE as V1_SCHEMA_NAMESPACE } from '../schema-namespace';
import arrayContaining = jasmine.arrayContaining;

class Asserter {
  constructor(public isValid, public errors) {}

  /**
   * @return {Asserter}
   */
  assertIsValid() {
    expect(this.isValid).toBe(true);
    return this;
  }

  /**
   * @return {Asserter}
   */
  assertIsInvalid() {
    expect(this.isValid).toBe(false);
    return this;
  }

  /**
   * @return {Asserter}
   */
  assertHasErrorForRequiredProp(propertyName) {
    return this.assertErrorContaining({
      keyword: 'required',
      params: { missingProperty: propertyName },
    });
  }

  /**
   * @return {Asserter}
   */
  assertHasErrorForEmptyProp(propertyName) {
    return this.assertErrorContaining({
      keyword: 'minLength',
      dataPath: `.${propertyName}`,
    });
  }

  assertHasErrorForMismatchingPropertyType(propertyName, expectedType) {
    return this.assertErrorContaining({
      dataPath: `.${propertyName}`,
      keyword: 'type',
      params: { type: expectedType },
    });
  }

  assertHasErrorForMismatchingPattern(propertyName) {
    return this.assertErrorContaining({
      keyword: 'pattern',
      dataPath: `.${propertyName}`,
    });
  }

  assertHasErrorForMismatchingPropertyEnum(propertyName, expectedType) {
    return this.assertErrorContaining({
      dataPath: `.${propertyName}`,
      keyword: 'enum',
      params: { allowedValues: expectedType },
    });
  }

  assertErrorContaining(what) {
    expect(this.errors).toEqual(expect.arrayContaining([expect.objectContaining(what)]));
    return this;
  }
}

class Validator {
  isValid = false;
  errors: any[] = null;
  constructor(public validateFn, public errorsHolder) {}

  validate(value) {
    this.isValid = this.validateFn(value);
    this.errors = this.errorsHolder.errors;
    return this.isValid;
  }

  /**
   *
   * @return {Asserter}
   */
  createAsserter() {
    return new Asserter(this.isValid, this.errors);
  }

  /**
   *
   * @param value
   * @return {Asserter}
   */
  validateAndCreateAsserter(value) {
    this.validate(value);
    return this.createAsserter();
  }
}

class AjvTestContext {
  private readonly ajv: Ajv.Ajv;
  private readonly mainSchemaName: string;
  private readonly schemaNamespace: string;
  private readonly ajvOptions: Ajv.Options;
  /**
   * @param {Object} params
   * @param {string} params.mainSchemaName
   * @param {string} params.schemaNamespace
   * @param {ajv.Options} params.ajvOptions
   */
  constructor({ mainSchemaName, schemaNamespace, ajvOptions }) {
    this.ajv = new Ajv({ ...ajvOptions });
    this.schemaNamespace = schemaNamespace;
    this.mainSchemaName = mainSchemaName;
    this.ajvOptions = ajvOptions;
  }

  /**
   * @return {Validator}
   */
  createValidator() {
    return new Validator(value => this.validate(value), this.ajv);
  }

  compileDefinitionSubschema(definitionName) {
    return this.ajv.compile({
      $id: `${this.schemaNamespace}/test.json`,
      $ref: `${this.mainSchemaName}.json#/definitions/${definitionName}`,
    });
  }

  /**
   * @return {Validator}
   */
  createValidatorForSubschema(definitionName) {
    const validFn = this.compileDefinitionSubschema(definitionName);
    return new Validator(validFn, validFn);
  }

  validate(value) {
    return this.ajv.validate(`${V1_SCHEMA_NAMESPACE}/${this.mainSchemaName}.json`, value);
  }

  getErrors() {
    return this.ajv.errors;
  }

  firstError() {
    const [firstError] = this.ajv.errors;
    return firstError;
  }

  /**
   * @param {ajv.Options} mergeAjvOptionsWith
   * @return {AjvTestContext}
   */
  cloneContext(mergeAjvOptionsWith) {
    return new AjvTestContext({
      mainSchemaName: this.mainSchemaName,
      schemaNamespace: this.schemaNamespace,
      ajvOptions: { ...this.ajvOptions, ...mergeAjvOptionsWith },
    });
  }
}

/**
 *
 * @param mainSchemaName
 * @param schemas
 * @param additionalAjvOptions
 * @return {AjvTestContext}
 */
export function makeAjvContext(mainSchemaName, schemas, additionalAjvOptions?) {
  return new AjvTestContext({
    mainSchemaName,
    schemaNamespace: V1_SCHEMA_NAMESPACE,
    ajvOptions: { ...additionalAjvOptions, schemas },
  });
}
