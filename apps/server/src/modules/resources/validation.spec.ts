import { cloneDeep, omit } from 'lodash';
import { genericFieldsValidator as validateGenericFields } from './validation';

const DEFAULT_TEST_RESOURCE = {
  name: 'someName',
  description: 'some description',
  type: 'flow',
  data: {
    someData: 'foo',
    otherData: 'bar',
  },
};

const isRegisteredType = type => true;

test('Validation passes with valid data', () => {
  const errors = validateGenericFields(isRegisteredType)(
    cloneDeep(DEFAULT_TEST_RESOURCE)
  );
  expect(errors).toBeFalsy();
});

test('It fails without a type', () => {
  const errors = validateGenericFields(isRegisteredType)(
    omit(DEFAULT_TEST_RESOURCE, 'type')
  );
  expect(errors).toContainEqual(
    expect.objectContaining({ keyword: 'required', params: { missingProperty: 'type' } })
  );
});

test('It fails if type is not registered', () => {
  const testResource = { ...DEFAULT_TEST_RESOURCE };
  const errors = validateGenericFields(type => false)(testResource);
  expect(errors).toContainEqual(
    expect.objectContaining({
      keyword: 'registered-resource-type',
      params: { resourceType: 'flow' },
    })
  );
});

test('Data property is not modified', () => {
  const testResource = cloneDeep(DEFAULT_TEST_RESOURCE);
  const errors = validateGenericFields(isRegisteredType)(testResource);
  expect(errors).toBeFalsy();
  expect(testResource.data).toEqual(DEFAULT_TEST_RESOURCE.data);
});

test('Removes extraneous properties', () => {
  const testResource = { ...DEFAULT_TEST_RESOURCE, foo: 'x', bar: 'baz' };
  const errors = validateGenericFields(isRegisteredType)(testResource);
  expect(errors).toBeFalsy();
  expect(Object.keys(testResource)).not.toEqual(expect.arrayContaining(['foo', 'bar']));
});
