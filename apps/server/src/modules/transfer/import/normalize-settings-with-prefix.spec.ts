import { normalizeSettingsWithPrefix } from './normalize-settings-with-prefix';

describe('transfer.common.normalizeSettingsWithPrefix', () => {
  test('Should normalize the setting value with the latest syntax', () => {
    const sampleJSON = { test: 'json' };
    expect(
      normalizeSettingsWithPrefix({
        setting1: 'literal_value',
        setting2: '$assignment_value',
        setting3: 20,
        setting4: sampleJSON,
      })
    ).toEqual({
      setting1: 'literal_value',
      setting2: '=$assignment_value',
      setting3: 20,
      setting4: { ...sampleJSON },
    });
  });
});
