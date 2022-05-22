import { normalizeSettings } from './normalize-settings';

describe('function: normalizeSettings()', () => {
  it('should remove prefix to the expression type', () => {
    expect(normalizeSettings({ key: '=value' })).toEqual({ key: 'value' });
  });
});
