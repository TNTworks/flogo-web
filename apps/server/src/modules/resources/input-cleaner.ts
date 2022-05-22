import { pick } from 'lodash';
import { Resource } from '@flogo-web/lib-server/core';

const EDITABLE_FIELDS_CREATION: Array<keyof Resource> = [
  'name',
  'type',
  'description',
  'data',
  'metadata',
];
export function cleanInputOnCreate(resource): Partial<Resource> {
  return cleanInput(resource, EDITABLE_FIELDS_CREATION);
}

const EDITABLE_FIELDS_UPDATE: Array<keyof Resource> = [
  'name',
  'description',
  'data',
  'metadata',
];
export function cleanInputOnUpdate(resource): Partial<Resource> {
  return cleanInput(resource, EDITABLE_FIELDS_UPDATE);
}

function cleanInput(action, fields) {
  const cleanAction = pick(action, fields);
  if (cleanAction.name) {
    cleanAction.name = cleanAction.name.trim();
  }
  return cleanAction;
}
