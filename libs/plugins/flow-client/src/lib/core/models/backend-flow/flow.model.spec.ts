import { parseFlowMappings } from './flow.model';

describe('flow.model', function() {
  describe('#parseFlowMappings', function() {
    it('works with empty mapping collections', function() {
      expect(parseFlowMappings(undefined)).toBeTruthy();
      expect(parseFlowMappings([])).toBeTruthy();
    });

    it('Ignores unknown property values', function() {
      const parsedMappings = parseFlowMappings([
        {
          value: 1,
          type: 2,
          mapTo: 'myField',
          somethingElse: 'abcd',
        },
      ]);
      expect(parsedMappings[0]).toEqual(
        jasmine.objectContaining({
          value: 1,
          type: 2,
          mapTo: 'myField',
        })
      );
      expect(Object.keys(parsedMappings[0])).not.toEqual(
        jasmine.arrayContaining(['somethingElse'])
      );
    });

    it('Ignores empty strings', function() {
      expect(
        parseFlowMappings([
          {
            value: '',
            type: 2,
            mapTo: 'myThing',
          },
        ]).length
      ).toEqual(0);
    });

    it('Does not ignore non-empty strings', function() {
      ['\n', '\n\r', '\t'].forEach(value => {
        expect(
          parseFlowMappings([
            {
              value,
              type: 2,
              mapTo: 'myThing',
            },
          ]).length
        ).toEqual(
          1,
          `Expected ${JSON.stringify(value)} to be treated as non-empty string`
        );
      });
    });

    describe('For different value types', function() {
      const parsedMappings = parseFlowMappings([
        { value: '$myMapping.value', type: 1, mapTo: 'a' },
        { value: 1, type: 2, mapTo: 'b' },
        { value: false, type: 2, mapTo: 'c' },
        { value: { myObject: 'myProp' }, type: 4, mapTo: 'd' },
      ]);

      it('correctly parses strings', () => {
        expect(parsedMappings[0].value).toBe('$myMapping.value');
      });

      it('correctly parses strings', () => {
        expect(parsedMappings[1].value).toBe(1);
      });

      it('correctly parses strings', () => {
        expect(parsedMappings[2].value).toBe(false);
      });

      it('correctly parses objects', () => {
        expect(parsedMappings[3].value).toEqual({ myObject: 'myProp' });
      });
    });
  });
});
