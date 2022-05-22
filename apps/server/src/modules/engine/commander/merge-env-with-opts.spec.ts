import { mergeEnvWithOpts } from './merge-env-with-opts';

describe('engine::commander::mergeEnvWithOpts()', () => {
  it('Uses the cgo value from the environment if provided', () => {
    const env = mergeEnvWithOpts({ compile: {} }, { CGO_ENABLED: '1' });
    expect(env).toEqual({ CGO_ENABLED: '1' });
  });

  it('Uses the default cgo value if not provided in the environment', () => {
    const env = mergeEnvWithOpts({ compile: {} }, {});
    expect(env).toEqual({ CGO_ENABLED: '0' });
  });
});
