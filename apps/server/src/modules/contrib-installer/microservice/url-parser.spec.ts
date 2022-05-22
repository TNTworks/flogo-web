import { normalizeContribUrl } from './url-parser';

const assertParsedEquals = (url, expected) =>
  expect(normalizeContribUrl(url)).toEqual(expected);

describe('parse', () => {
  it('should parse url', function() {
    assertParsedEquals(
      'github.com/TNTworks/flogo-contrib/activity/rest',
      'github.com/TNTworks/flogo-contrib/activity/rest'
    );
    assertParsedEquals(
      'github.com/TNTworks/flogo-contrib/tree/master/activity/rest',
      'github.com/TNTworks/flogo-contrib/activity/rest'
    );
    assertParsedEquals(
      'https://github.com/project-flogo/rootrepo',
      'github.com/project-flogo/rootrepo'
    );
    assertParsedEquals('https://some.other.url/a/b', 'some.other.url/a/b');
    assertParsedEquals('some.other.url/a/b', 'some.other.url/a/b');
    assertParsedEquals(
      'https://some.other.url/tree/master/a/b',
      'some.other.url/tree/master/a/b'
    );
  });
});
