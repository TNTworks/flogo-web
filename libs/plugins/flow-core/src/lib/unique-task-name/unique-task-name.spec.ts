import { hasTaskWithSameName } from './unique-task-name';

describe('flow.core.models.unique-task-name-validator', () => {
  it('should check if name is repeated', () => {
    // the order of tasks must not be changed
    const repeatedName = hasTaskWithSameName('new task', {
      task_1: {
        type: 1,
        name: 'task 1',
      },
      branch_1: {
        type: 3,
      },
      task_2: {
        type: 1,
        name: 'new task',
      },
    });
    expect(repeatedName).toBeDefined();
    expect(repeatedName).toEqual(true);
  });
});
