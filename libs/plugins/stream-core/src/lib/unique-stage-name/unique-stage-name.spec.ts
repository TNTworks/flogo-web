import { hasStageWithSameName } from './unique-stage-name';

describe('stream.core.models.unique-stage-name-validator', () => {
  it('should check if name is repeated', () => {
    // the order of tasks must not be changed
    const repeatedName = hasStageWithSameName('new stage', {
      task_1: {
        type: 1,
        name: 'task 1',
      },
      task_2: {
        type: 1,
        name: 'new stage',
      },
    });
    expect(repeatedName).toBeDefined();
    expect(repeatedName).toEqual(true);
  });
});
