import { of } from 'rxjs';
import { combineToDebugActivity, DebugActivityTask } from './debug-activity-task';

describe('debug-panel.debug-activity-task.combineToDebugActivity', function() {
  const emitAndCombine = emitValues =>
    of(emitValues)
      .pipe(combineToDebugActivity())
      .toPromise();

  it('A merged debug activity tasks', async () => {
    const result = await emitAndCombine([
      {
        id: 'my-schema',
        name: 'my-schema',
        homepage: 'https://my.activity.homepage.com',
        icon: 'some-icon',
      },
      { id: 'activity1', name: 'my activity', return: true },
    ]);
    expect<Partial<DebugActivityTask>>(result).toEqual({
      id: 'activity1',
      name: 'my activity',
      return: true,
      schemaHomepage: 'https://my.activity.homepage.com',
      icon: 'some-icon',
    });
  });

  it('Returns null when both streams are empty', async () => {
    const result = await emitAndCombine([null, null]);
    expect(result).toBeFalsy();
  });

  it('Returns null when activity schema is empty', async () => {
    const result = await emitAndCombine([null, { id: 'activity1', name: 'my activity' }]);
    expect(result).toBeFalsy();
  });

  it('Returns null when activity task is empty', async () => {
    const result = await emitAndCombine([
      {
        id: 'my-schema',
        name: 'my-schema',
        homepage: 'https://my.activity.homepage.com',
      },
      null,
    ]);
    expect(result).toBeFalsy();
  });
});
