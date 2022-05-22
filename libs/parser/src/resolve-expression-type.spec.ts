import { resolveExpressionType } from './resolve-expression-type';

describe('Parser Type Resolver', () => {
  function assertParsedType(expectedType, expr) {
    test(`For ${expr}`, () => {
      const parsedType = resolveExpressionType(expr);
      expect(parsedType).toBe(expectedType);
    });
  }

  const testResolvesToType = (expectedType, cases) => {
    describe(`${expectedType}`, () =>
      cases.forEach(text => assertParsedType(expectedType, text)));
  };

  describe('for valid input', () => {
    describe('it correctly determines its type', () => {
      testResolvesToType('attrAccess', [
        '$.inputName',
        '$activity',
        '$trigger',
        '$regularVar.withProp',
        '$regularVar.with.nested.props',
        '$activity[my_activity]',
        '$activity[myActivity].with.nested.props',
        '$activity[myActivity].withProps',
        '$arrayVar[0].with.props',
        '$myVarIsAnArray[0]',
        '$myVar.has.an.array[0]',
        '$myVar.has.an.array[1].with.another[0].prop',
        '$activity[my_activity].can.be.Combined.with.arrays[0]',
        '$env[MY_ENV_PROP]',
        '$property[i.want.to.namespace.my.props]',
        'a25',
        'adadsa',
        '$abcd',
      ]);

      testResolvesToType('literal', [
        '1',
        '1.4',
        '-5',
        '-2.8',
        '"with double quotes"',
        `'with single quotes'`,
        'true',
        'false',
        'null',
        'nil',
      ]);

      testResolvesToType('json', [
        '{}',
        '{ "a": 1, "b": {"c": [{"d": "e" }]} }',
        `{ "a": 1,
            "b": {
              "c": [{"d": "e" }]
            }
         }`,
        `{ "a": "{{ $activity[xyz].result.id }}" }`,
        `{ "foo": ["{{ string.concat($activity[hello].world, $flow.a[0]) }}"] }`,
        `{"q": "{{string.concat(\\"isbn:\\", $flow.isbn)}}"}`,
        `{"q": "{{string.concat('isbn:', $flow.isbn)}}"}`,
        `{ "foo": null }`,
      ]);

      testResolvesToType('expression', [
        'string.concat($property[i.want.to.namespace.my.props],"qwerty")',
        '$.inputName != 2',
        '$a + $b',
        '$a + $b.c',
        '$a < $b.c',
        '$a >= $b.c',
        '$a < $b.c',
        '$a <= $b.c',
        '$a == $b.c',
        '1 + 2 + 3',
        '1 + 2 > 3 + $a.b.c',
        '$a - 3 * $a.b[0]',
        '$activity[my_activity].array[0].id || 45 && false',
        'isDefined()',
        'string.concat("a", 1, $.input, $activity[xyz].someProp, otherFuncCall(2))',
        'a ? b : c',
        '1 > 5 ? "hello" : $activity[a].b',
        '1>2?string.concat("sss","ddd"):"ffff"',
        '200>100?true:false',
        '$activity[C].result==3',
        'string.length($TriggerData.queryParams.id) == 0 ? "Query Id cannot be null" : string.length($TriggerData.queryParams.id)',
        'string.length("lixingwang")>11?$env.name:$env.address',
        '123==456',
        'string.concat("123","456")=="123456"',
        'string.concat("123","456") == string.concat("12","3456")',
        '("dddddd" == "dddd3dd") && ("133" == "123")',
        `string.concat('123','456')=='123456'`,
        `string.concat('123','456') == string.concat('12','3456')`,
        `('dddddd' == 'dddd3dd') && ('133' == '123')`,
        'string.length("flogoweb") == 8',
        'string.length("flogoweb") > 8',
        'string.length("flogoweb") >= 8',
        'string.length("flogoweb") < 8',
        'string.length("flogoweb") <= 8',
        'len("flogo") <= 10',
        '(string.length("sea") == 3) == true',
        '(true && true) == false',
        '(true && true) != nil',
        '123 != nil',
        'nil == nil',
        '$env.name != nil',
        `$env.name == "test"`,
        '$.name.test == nil',
        `$.name.test != nil`,
        `$.name.test == "123"`,
        `$.name.test == "test"`,
        `$.name.obj.value == nil`,
        `$.name.obj.id == 123`,
        `$env.name != null`,
        `$env.name == "test"`,
        `$env.name == 'test'`,
        `$.name.test == null`,
        `$.name.test != null`,
        `$.name.test == "123"`,
        `$.name.test == "test"`,
        `$.name.obj.value == null`,
        `$.name.obj.doesnotexist == null`,
        '(null)',
      ]);
    });
  });

  describe('for invalid input dismisses incorrect expressions', () => {
    testResolvesToType(null, [
      '$trigger[]',
      '$abcd.',
      '$abcd.e[what]',
      '1.4.25',
      '25a',
      '{ "a": 1, b: {} }',
      '{ "a": 1, b: {} ',
      `{ 'a': 'b' }`,
      `{ "foo": nil }`,
      '',
      '$a >',
      `{ "a": "{{}}" }`,
      `a ? 4`,
      `1 > ? a : b`,
      `true ? a`,
      `!true`,
    ]);
  });
});
