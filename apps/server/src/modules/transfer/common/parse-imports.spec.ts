import { parseImports, parseSingleImport } from './parse-imports';

describe('parseImports', () => {
  test('should parse all imports', () => {
    expect(
      parseImports([
        'github.com/project-flogo/trigger/timer',
        'customAlias github.com/project-flogo/activity/rest',
        'github.com/project-flogo/activity/i-mSpE_.cial',
        'sp-_ec-i.alias github.com/project-flogo/activity/i-mSpE_.cial',
        // TODO: confirm it should be permissive with spaces
        '   paddedAlias       github.com/withspaces   ',
        '   github.com/padded   ',
      ])
    ).toEqual([
      { ref: 'github.com/project-flogo/trigger/timer', type: 'timer', isAliased: false },
      {
        ref: 'github.com/project-flogo/activity/rest',
        type: 'customAlias',
        isAliased: true,
      },
      {
        ref: 'github.com/project-flogo/activity/i-mSpE_.cial',
        type: 'i-mSpE_.cial',
        isAliased: false,
      },
      {
        ref: 'github.com/project-flogo/activity/i-mSpE_.cial',
        type: 'sp-_ec-i.alias',
        isAliased: true,
      },
      { ref: 'github.com/withspaces', type: 'paddedAlias', isAliased: true },
      { ref: 'github.com/padded', type: 'padded', isAliased: false },
    ]);
  });

  test('should not accept malformed imports', () => {
    [
      'a b d',
      '',
      null,
      undefined,
      'abc/def/',
      'abc/def aliasShouldNotBeHere',
    ].forEach(testCase => expect(() => parseSingleImport(testCase)).toThrow());
  });
});
