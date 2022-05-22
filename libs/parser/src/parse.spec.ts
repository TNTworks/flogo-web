import { JsonNodes } from './ast';
import { parse, parseResolver } from './parse';
import './tests/jest-matchers';

describe('parse', function() {
  it('parses simple resolvers', function() {
    const parseResult = parseResolver(`$env[something]`);
    expect(parseResult.ast).toMatchObject({
      type: 'ScopeResolver',
      name: 'env',
      sel: 'something',
    });
  });

  it('parses object string templates', function() {
    const parseResult = parse(`{
      "simpleLiteral": "bar",
      "stringTemplate": "{{ $activity[x].y }}",
      "stringTemplateInArray": ["{{ somefunc(3) }}", "somelit", "{{ $activity[x].y }}"]
    }`);

    expect(parseResult.ast).toMatchObject({
      type: 'json',
      value: {
        type: 'jsonObject',
        children: [
          {
            type: 'jsonProperty',
            key: 'simpleLiteral',
            value: <JsonNodes.LiteralNode>{
              type: 'jsonLiteral',
              value: 'bar',
              kind: 'string',
              raw: '"bar"',
            },
          },
          {
            type: 'jsonProperty',
            key: 'stringTemplate',
            value: <JsonNodes.StringTemplateNode>{
              type: 'stringTemplate',
              expression: {
                type: 'SelectorExpr',
                x: {
                  type: 'ScopeResolver',
                  name: 'activity',
                  sel: 'x',
                },
                sel: <any>'y',
              },
            },
          },
          <JsonNodes.PropertyNode>{
            type: 'jsonProperty',
            key: 'stringTemplateInArray',
            value: {
              type: 'jsonArray',
              children: [
                <JsonNodes.StringTemplateNode>{
                  type: 'stringTemplate',
                  expression: {
                    type: 'CallExpr',
                    fun: {
                      type: 'Identifier',
                      name: 'somefunc',
                    },
                    args: [
                      {
                        type: 'BasicLit',
                        kind: 'number',
                        value: 3,
                        raw: '3',
                      },
                    ],
                  },
                },
                {
                  type: 'jsonLiteral',
                  value: 'somelit',
                  kind: 'string',
                  raw: '"somelit"',
                },
                {
                  type: 'stringTemplate',
                  expression: {
                    type: 'SelectorExpr',
                    x: {
                      type: 'ScopeResolver',
                      name: 'activity',
                      sel: 'x',
                    },
                    sel: <any>'y',
                  },
                },
              ],
            },
          },
        ],
      },
    });
  });

  it('parses inline object expressions', function() {
    const parseResult = parse(`{
      "simpleLiteral": "bar",
      "stringTemplate": "=$activity[x].y",
      "stringTemplateInArray": ["=somefunc(3)", "somelit", "=$activity[x].y"]
    }`);

    expect(parseResult.ast).toMatchObject({
      type: 'json',
      value: {
        type: 'jsonObject',
        children: [
          {
            type: 'jsonProperty',
            key: 'simpleLiteral',
            value: <JsonNodes.LiteralNode>{
              type: 'jsonLiteral',
              value: 'bar',
              kind: 'string',
              raw: '"bar"',
            },
          },
          {
            type: 'jsonProperty',
            key: 'stringTemplate',
            value: <JsonNodes.StringTemplateNode>{
              type: 'stringTemplate',
              expression: {
                type: 'SelectorExpr',
                x: {
                  type: 'ScopeResolver',
                  name: 'activity',
                  sel: 'x',
                },
                sel: <any>'y',
              },
            },
          },
          <JsonNodes.PropertyNode>{
            type: 'jsonProperty',
            key: 'stringTemplateInArray',
            value: {
              type: 'jsonArray',
              children: [
                <JsonNodes.StringTemplateNode>{
                  type: 'stringTemplate',
                  expression: {
                    type: 'CallExpr',
                    fun: {
                      type: 'Identifier',
                      name: 'somefunc',
                    },
                    args: [
                      {
                        type: 'BasicLit',
                        kind: 'number',
                        value: 3,
                        raw: '3',
                      },
                    ],
                  },
                },
                {
                  type: 'jsonLiteral',
                  value: 'somelit',
                  kind: 'string',
                  raw: '"somelit"',
                },
                {
                  type: 'stringTemplate',
                  expression: {
                    type: 'SelectorExpr',
                    x: {
                      type: 'ScopeResolver',
                      name: 'activity',
                      sel: 'x',
                    },
                    sel: <any>'y',
                  },
                },
              ],
            },
          },
        ],
      },
    });
  });

  it('parses ternary expressions', function() {
    const parseResult = parse('a > b ? true : false');
    expect(parseResult).toHaveBeenSuccessfullyParsed();
    expect(parseResult).toBeExpressionOfType('TernaryExpr');
  });

  it('parses expressions with parenthesis', function() {
    const parseResult = parse('(true)');
    expect(parseResult).toHaveBeenSuccessfullyParsed();
    expect(parseResult).toBeExpressionOfType('ParenExpr');
  });

  it('parses expressions with parenthesis', function() {
    const parseResult = parse('(a + 2) * 55');
    expect(parseResult).toHaveBeenSuccessfullyParsed();
    expect(parseResult).toBeExpressionOfType('BinaryExpr');
  });

  describe('it handles json values', () => {
    it('for well formed json', () => {
      const parseResult = parse(`{
         "aString": "abcd",
         "anInteger": 2345,
         "aDouble": 78.91,
         "aBoolean": false,
         "anObject": { "foo": { "bar": true } },
         "anArray": [ 1, { "foo": "bar" }, true ]
      }`);
      expect(parseResult).toHaveBeenSuccessfullyParsed();
      expect(parseResult.ast.type).toEqual('json');
    });

    it('does not take single quoted strings', () => {
      expect(parse(`{ 'a': "b" }`)).not.toHaveBeenSuccessfullyParsed();
      expect(parse(`{ "a": 'b' }`)).not.toHaveBeenSuccessfullyParsed();
    });
  });

  it('parser bracket notation property accessing', () => {
    expect(parse(`$.flow["prop1"]`)).toHaveBeenSuccessfullyParsed();
    expect(parse(`$.flow['prop2']`)).toHaveBeenSuccessfullyParsed();
    expect(parse(`$activity["prop"]`)).toHaveBeenSuccessfullyParsed();
    expect(
      parse(`{
      "prop1" : "=obj['prop1']",
      "prop2" : "=array[7]"
    }`)
    ).toHaveBeenSuccessfullyParsed();
    expect(
      parse(`{
    "mapping": {
      "@foreach($activity[xml2json_2].jsonObject.MarketArticle,i)": { "marketArea": "=$loop[i][\\"-marketArea\\"]" }
      }
    }`)
    ).toHaveBeenSuccessfullyParsed();
  });

  it('parses expressions with back quote string', () => {
    expect(parse('$.flow[`prop2`]')).toHaveBeenSuccessfullyParsed();
    expect(parse(`string.concat(\`a\`, 'b', "c")`)).toHaveBeenSuccessfullyParsed();
  });
});
