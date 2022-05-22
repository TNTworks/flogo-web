import { initDb, persistedDb } from './db';

let collection: Collection<any>;

beforeEach(async () => {
  await initDb({ persist: false });
  collection = persistedDb.addCollection('test');
});

describe('db library integration', () => {
  it('should save object with dots in its keys', function() {
    const inserted = collection.insert({
      'my.object': {
        'is.nested': {
          foo: [
            {
              'bar.baz': true,
            },
          ],
        },
      },
    });

    expect(inserted).toMatchObject({
      'my.object': {
        'is.nested': {
          foo: [
            {
              'bar.baz': true,
            },
          ],
        },
      },
    });

    expect(collection.get(inserted.$loki)).toMatchObject({
      'my.object': {
        'is.nested': {
          foo: [
            {
              'bar.baz': true,
            },
          ],
        },
      },
    });
  });
});
