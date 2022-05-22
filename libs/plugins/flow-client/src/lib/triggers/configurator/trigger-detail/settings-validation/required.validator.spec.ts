import { isString, isNull } from 'lodash';
import { SettingValue } from '../settings-value';
import { requiredValidator } from './required.validator';
import { makeExpectationFunctions } from './testing/make-expectation-functions';

describe('requiredValidator', () => {
  it('Should correctly validate required values', () => {
    const { shouldPass, shouldFail } = makeExpectationFunctions(requiredValidator);
    shouldPass(createTestData(0));
    shouldPass(createTestData(false));
    shouldPass(createTestData('true'));
    shouldPass(createTestData(-123));
    shouldFail(createTestData(undefined));
    shouldFail(createTestData(null));
    shouldFail(createTestData(''));
    shouldFail(createTestData('      '));
  });
});

function createTestData(value: any): { value: SettingValue } {
  return {
    value: {
      parsedValue: value,
      viewValue: isString(value) || isNull(value) ? value : JSON.stringify(value),
    },
  };
}
