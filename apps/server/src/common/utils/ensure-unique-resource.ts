import { Resource } from '@flogo-web/core';
import { findGreatestNameIndex } from './collection';

export function ensureUniqueResourceName(
  resources: Resource[],
  name: string,
  resourceIndex = resources.length
) {
  const greatestIndex = findGreatestNameIndex(name, resources);
  if (isResourceNameExists(name, resources, resourceIndex) || greatestIndex > 0) {
    name = `${name} (${greatestIndex + 1})`;
  }
  return name;
}

function isResourceNameExists(name, resources, index): boolean {
  return resources.slice(0, index).find(resource => resource.name === name);
}
