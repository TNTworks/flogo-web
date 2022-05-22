export const makeExpectationFunctions = validatorFunction => ({
  shouldPass: val =>
    expect(validatorFunction(val)).toBeFalsy(`Expected ${val} to pass the validation`),
  shouldFail: val =>
    expect(validatorFunction(val)).toBeTruthy(
      `Expected ${val} to NOT pass the validation`
    ),
});
