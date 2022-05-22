import { isIterableTask, isAcceptableIterateValue } from './is-iterable-task';

describe('utils.isIterableTask', () => {
  test('It should check if the task is iterable or not', () => {
    expect(
      isIterableTask({
        settings: {
          iterate: 20,
        },
      })
    ).toBeTruthy();
    expect(
      isIterableTask({
        settings: {
          iterate: '',
        },
      })
    ).toBeFalsy();
  });
});

describe('utils.isAcceptableIterateValue', () => {
  test('It should check if the iterate value is acceptable', () => {
    expect(isAcceptableIterateValue(20)).toBeTruthy();
    expect(isAcceptableIterateValue('20')).toBeTruthy();
    expect(isAcceptableIterateValue('random.number(20)')).toBeTruthy();
    expect(isAcceptableIterateValue(undefined)).toBeFalsy();
    expect(isAcceptableIterateValue(null)).toBeFalsy();
    expect(isAcceptableIterateValue('')).toBeFalsy();
  });
});
