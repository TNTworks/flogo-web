import { getInternalTasksPath } from './flow';
import { TASK_HANDLER_NAME_ROOT } from '../constants';
import { TASK_HANDLER_NAME_ERROR } from '../constants';

describe('common.utils.flow', () => {
  describe('getInternalTasksPath()', () => {
    it('should return path of tasks for root handler', () => {
      expect(getInternalTasksPath(TASK_HANDLER_NAME_ROOT)).toEqual('tasks');
    });

    it('should return path of tasks for error handler', () => {
      expect(getInternalTasksPath(TASK_HANDLER_NAME_ERROR)).toEqual('errorHandler.tasks');
    });
  });
});
