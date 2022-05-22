import { isNil, get } from 'lodash';

export function isIterableTask(task): boolean {
  return isAcceptableIterateValue(get(task, 'settings.iterate'));
}

export function isAcceptableIterateValue(value: any) {
  return !isNil(value) && value !== '';
}
