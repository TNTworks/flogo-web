import { ActionImporter } from './action-importer';
import { TaskConverter } from './task-converter';

export function createActionImporter() {
  return new ActionImporter((task, schema) => new TaskConverter(task, schema));
}
