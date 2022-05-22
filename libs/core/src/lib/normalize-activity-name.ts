import { kebabCase } from 'lodash';

export function normalizeActivityName(taskName: string) {
  return kebabCase(taskName);
}
