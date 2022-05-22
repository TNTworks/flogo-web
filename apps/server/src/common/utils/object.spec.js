import { ensureKeyOrder } from './object';

describe('common.utils.object', () => {
  describe('ensureKeyOrder()', () => {
    const objectToOrder = { baz: [], foo: 'hello', additional: 99 };
    const keyOrder = ['foo', 'bar', 'baz'];
    const reordered = ensureKeyOrder(objectToOrder, keyOrder);
    test('should reorder the fields of an object based on the provided keys order', () => {
      expect(JSON.stringify(reordered)).toBe(
        JSON.stringify({ foo: 'hello', baz: [], additional: 99 })
      );
    });
    test('should omit specified keys in the key order that are not present in the object', () => {
      expect(Object.prototype.hasOwnProperty.call(reordered, 'bar')).toBe(false);
    });
    test('should include the properties in the object that were not specified in the key order', () => {
      expect(reordered.additional).toBe(99);
    });
  });
});
