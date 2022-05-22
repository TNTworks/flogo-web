// can debug in: https://microsoft.github.io/monaco-editor/monarch.html
export function load() {
  return {
    keywords: ['true', 'false', 'null', 'nil'],

    builtins: [],

    operators: [
      '=',
      '>',
      '<',
      '!',
      '?',
      ':',
      '==',
      '<=',
      '>=',
      '!=',
      '&&',
      '||',
      '+',
      '-',
      '*',
      '/',
      '&',
      '|',
      '^',
      '%',
    ],

    // define our own brackets as '<' and '>' do not match in javascript
    brackets: [
      ['(', ')', 'bracket.parenthesis'],
      ['{', '}', 'bracket.curly'],
      ['[', ']', 'bracket.square'],
      ['{{', '}}', 'bracket.curly'],
    ],

    resolvers: /activity|trigger|current|flow|error|iterate|env|property/,

    // common regular expressions
    symbols: /[~!@#%\^&*-+=|\\:`<>.?\/]+/,
    escapes: /\\(?:[btnfr\\"']|[0-7][0-7]?|[0-3][0-7]{2})/,
    exponent: /[eE][\-+]?[0-9]+/,

    tokenizer: {
      root: [
        { include: '@baseExpr' },

        [/{/, 'json.delimiter', '@json'],

        // delimiters and operators
        [/[{}()\[\]]/, '@brackets'],

        // strings: recover on non-terminated strings
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
        [/'([^'\\]|\\.)*$/, 'string.invalid'], // non-teminated string
        [/"/, 'string', '@string."'],
        [/'/, 'string', "@string.'"],
      ],

      whitespace: [[/[ \t\r\n]+/, 'white']],

      templateExpr: [
        { include: '@baseExpr' },
        [/[()\[\]]/, '@brackets'],
        [/}}/, { token: '@rematch', next: '@pop' }],
      ],

      inlineObjectExpr: [
        { include: '@baseExpr' },
        [/[()\[\]]/, '@brackets'],
        [/\"/, { token: '@rematch', next: '@pop' }],
      ],

      json: [
        { include: '@whitespace' },
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
        [/"/, 'json.key', '@jsonKey."'],
        [/:\s*/, 'json.delimiter', '@jsonValue'],
        [/,/, 'json.delimiter'],
        [/}/, { token: 'json.delimiter', next: '@pop' }],
      ],

      jsonValue: [
        [/"([^"\\]|\\.)*$/, 'string.invalid', '@pop'], // non-teminated string
        [/"/, { token: 'json.string', switchTo: '@stringTemplate."' }],
        [/{/, { token: 'json.delimiter', switchTo: '@json' }],
        [/\d+\.\d*(@exponent)?/, 'number.float', '@pop'],
        [/\.\d+(@exponent)?/, 'number.float', '@pop'],
        [/\d+@exponent/, 'number.float', '@pop'],
        [/0[xX][\da-fA-F]+/, 'number.hex', '@pop'],
        [/0[0-7]+/, 'number.octal', '@pop'],
        [/\d+/, 'number', '@pop'],
        [/true|false|null/, 'keyword', '@pop'],
        [/\[/, { token: 'json.delimiter', switchTo: '@jsonArray' }],
      ],

      jsonArray: [
        { include: '@whitespace' },
        [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
        [/"/, { token: 'json.string', next: '@stringTemplate."' }],
        [/{/, { token: 'json.delimiter', next: '@json' }],
        { include: '@numbers' },
        [/true|false|null/, 'keyword'],
        [/\[/, 'json.delimiter', '@jsonArray'],
        [/,/, 'json.delimiter'],
        [/\]/, 'json.delimiter', '@pop'],
      ],

      jsonKey: [
        [/[^\\"']+/, 'json.key'],
        [/@escapes/, 'json.key'],
        [/\\./, 'string.escape.invalid'],
        [
          /["']/,
          {
            cases: {
              '$#==$S2': { token: 'json.key', next: '@pop' },
              '@default': 'json.key',
            },
          },
        ],
      ],

      baseExpr: [
        [/([a-zA-Z_][\w\$]*)(\()/, ['function.call', 'delimiter']],

        // identifiers and keywords
        [
          /([a-zA-Z_][\w\$]*)(\s*)(:?)/,
          {
            cases: {
              '$1@keywords': ['keyword', 'white', 'delimiter'],
              $3: ['key.identifier', 'white', 'delimiter'], // followed by :
              '$1@builtins': ['predefined.identifier', 'white', 'delimiter'],
              '@default': ['identifier', 'white', 'delimiter'],
            },
          },
        ],

        [
          /(\$)(@resolvers)(\[\w+\])/,
          ['resolver.symbol', 'resolver.name', 'resolver.selector'],
        ],
        [/(\$)(@resolvers)/, ['resolver.symbol', 'resolver.name']],
        [/(\$)(\.)/, ['resolver.symbol', 'delimiter']],

        // whitespace
        { include: '@whitespace' },

        // delimiters and operators
        [/[;,.]/, 'delimiter'],
        [
          /@symbols/,
          {
            cases: {
              '@operators': 'operator',
              '@default': '',
            },
          },
        ],

        { include: '@numbers' },
      ],

      numbers: [
        [/\d+\.\d*(@exponent)?/, 'number.float'],
        [/\.\d+(@exponent)?/, 'number.float'],
        [/\d+@exponent/, 'number.float'],
        [/0[xX][\da-fA-F]+/, 'number.hex'],
        [/0[0-7]+/, 'number.octal'],
        [/\d+/, 'number'],
      ],

      stringTemplate: [
        [
          /{{/,
          {
            token: 'string-template.open',
            bracket: '@open',
            next: '@templateExpr',
          },
        ],
        [
          /=/,
          {
            token: 'string-template.open',
            bracket: '@open',
            next: '@inlineObjectExpr',
          },
        ],
        [
          /}}/,
          {
            token: 'string-template.close',
            bracket: '@close',
          },
        ],
        [/[^\\"']+/, 'json.string'],
        [/@escapes/, 'string.value.json'],
        [/\\./, 'string.invalid'],
        [
          /["']/,
          {
            cases: {
              '$#==$S2': { token: 'json.string', next: '@pop' },
              '@default': 'json.string',
            },
          },
        ],
      ],

      string: [
        [/[^\\"']+/, 'string'],
        [/@escapes/, 'string.escape'],
        [/\\./, 'string.escape.invalid'],
        [
          /["']/,
          {
            cases: {
              '$#==$S2': { token: 'string', next: '@pop' },
              '@default': 'string',
            },
          },
        ],
      ],
    },
  };
}
