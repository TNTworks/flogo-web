import { TaskConverter } from './task-converter';

describe('import.TaskConverter', () => {
  describe('#convertAttributes', () => {
    test('should prepare one entry in the attributes', () => {
      const sourceTask = {
        activity: {
          input: {
            baz: 'hello world',
          },
        },
      };
      const activitySchema = {
        inputs: [
          { name: 'foo', type: 'string' },
          { name: 'bar', type: 'array' },
          { name: 'baz', type: 'string' },
        ],
      };
      const taskConverter = new TaskConverter(sourceTask, activitySchema);

      const convertedMappings = taskConverter.prepareInputMappings();
      expect(convertedMappings).toEqual({ baz: 'hello world' });
    });

    test("should take task's input value on priority before schema's default values", () => {
      const sourceTask = {
        activity: {
          input: {
            baz: 'hello world',
          },
        },
      };
      const activitySchema = {
        inputs: [
          { name: 'foo', type: 'string' },
          { name: 'bar', type: 'array' },
          { name: 'baz', type: 'string', value: 'baz defaulted' },
        ],
      };
      const taskConverter = new TaskConverter(sourceTask, activitySchema);

      const convertedMappings = taskConverter.prepareInputMappings();
      expect(convertedMappings).toEqual({ baz: 'hello world' });
    });
  });
});
