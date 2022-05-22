import {
  parseAndExtractReferences,
  parseAndExtractReferencesInMappings,
} from './functions';

describe('functions:extract-references', () => {
  describe('extracts functions in expressions', () => {
    it('in simple functions', () => {
      expect(parseAndExtractReferences('string.concat(a, b)')).toEqual(['string.concat']);
    });

    it('in non namespaced functions', function() {
      expect(parseAndExtractReferences('someFunc()')).toEqual(['someFunc']);
    });

    it('in nested functions', function() {
      expect(
        parseAndExtractReferences(
          'root.level.func($activity[a].b, nested.function(with.another()))'
        )
      ).toEqual(['root.level.func', 'nested.function', 'with.another']);
    });

    it('in operations', function() {
      expect(
        parseAndExtractReferences('repeated.func() + repeated.func() + somevar')
      ).toEqual(['repeated.func']);
    });

    it('in boolean expressions', () => {
      expect(
        parseAndExtractReferences('repeated.func() + repeated.func() + somevar')
      ).toEqual(['repeated.func']);
      expect(parseAndExtractReferences('left() >= x.right()')).toEqual([
        'left',
        'x.right',
      ]);
    });
  });

  it('extracts functions in object templates', () => {
    expect(
      parseAndExtractReferences(`{
       "prop":"{{ string.concat(template.usage(), \\"foo\\") }}",
       "object":{
          "nested":"{{ number.random() }}"
       },
       "array": [ "{{ in.array() }}", "{{second.inArray()}}" ]
      }`)
    ).toEqual([
      'string.concat',
      'template.usage',
      'number.random',
      'in.array',
      'second.inArray',
    ]);
  });

  it('extracts functions in object mappings', () => {
    expect(
      parseAndExtractReferences(`{
       "prop":"=string.concat(template.usage(), \\"foo\\")",
       "object":{
          "nested": "=number.random()"
       },
       "array": [ "=in.array()", "=second.inArray()" ]
      }`)
    ).toEqual([
      'string.concat',
      'template.usage',
      'number.random',
      'in.array',
      'second.inArray',
    ]);
  });
});

describe('functions:extract-references-in-mappings', () => {
  it('Should return empty array when no expression is used', () => {
    expect(
      parseAndExtractReferencesInMappings({
        test: 'testing',
      })
    ).toEqual([]);
  });

  it('Should ignore mapping errors', () => {
    expect(
      parseAndExtractReferencesInMappings({
        test: false,
        test1: 'testing',
        test2: 232143,
        test3: '=sdafasdf',
      })
    ).toEqual([]);
  });

  it('Should give the proper list of functions used in the mappings', () => {
    expect(
      parseAndExtractReferencesInMappings({
        test: '=string.concat("dummy", "value")',
        test1:
          '={"testKey": "{{ string.equal() }}", "testKey2": "{{ string.concat() }}" }',
      })
    ).toEqual(['string.concat', 'string.equal']);
  });

  it('Should return unique set of functions', () => {
    expect(
      parseAndExtractReferencesInMappings({
        test: '=string.concat("dummy", "value")',
        test1: '=string.concat("hello", "world")',
      })
    ).toEqual(['string.concat']);
  });

  it('should process object mappings', () => {
    expect(
      parseAndExtractReferencesInMappings({
        test: { inside: '=string.concat("dummy", "value")' },
        test1: {
          nested: {
            inside: '=$hello.world',
            inside2: '=number.random(4)',
          },
        },
      })
    ).toEqual(['string.concat', 'number.random']);
  });

  it('should process object mappings in arrays', () => {
    expect(
      parseAndExtractReferencesInMappings({
        test: ['=string.concat("dummy", "value")'],
        test1: {
          nestedArray: ['=$activity[a].b', '=number.random(4)'],
        },
        test2: {
          nestedArray2: [{ mappingInObjectInArray: '=object.inArray()' }],
        },
        foo: null,
      })
    ).toEqual(['string.concat', 'number.random', 'object.inArray']);
  });
});
