import { normalizeIteratorValue } from './normalize-iterator-value';

describe('import.normalizeIteratorValue', () => {
  test('It should normalize the iterator values with prefix wherever needed', () => {
    expect(normalizeIteratorValue('20')).toEqual('20');
    expect(normalizeIteratorValue('true')).toEqual('true');
    expect(normalizeIteratorValue(true)).toEqual(true);
    expect(normalizeIteratorValue(20)).toEqual(20);
    expect(normalizeIteratorValue('testing')).toEqual('testing');
    expect(normalizeIteratorValue('$testing')).toEqual('=$testing');
    expect(normalizeIteratorValue('number.random(20)')).toEqual('=number.random(20)');
    expect(normalizeIteratorValue({ test: 'ing' })).toEqual('={\n  "test": "ing"\n}');
    expect(normalizeIteratorValue({ mapping: [10, 20, 30, 40] })).toEqual({
      mapping: [10, 20, 30, 40],
    });
  });
});
