/**
 * for "res://flow:my_cool_flow" gets "my_cool_flow"
 * @param resourceUri
 */
export function parseResourceNameFromResourceUri(resourceUri) {
  // flow refs have the structure res://flow:some-flow-id (https://github.com/project-flogo/flow/tree/master/activity/subflow#examples)
  return parseResourceIdFromResourceUri(resourceUri).split(':')[0];
}

/**
 * for "res://flow:my_cool_flow" gets "flow:my_cool_flow"
 * @param resourceUri
 */
export function parseResourceIdFromResourceUri(resourceUri) {
  // flow refs have the structure res://flow:some-flow-id (https://github.com/project-flogo/flow/tree/master/activity/subflow#examples)
  return resourceUri.replace(/^\s*res:\/\//, '');
}
