import { get, isObject } from 'lodash';

/**
 * Finds out if an activity schema represents a mapper activity.
 * To be considered a mapper activity the schema should have at least one settings property that declares
 * a display.type property as "mapper".
 * @example
 *  {
 *    settings: [ {
 *      name: "mappings",
 *      type: "any",
 *      "required": true,
 *      "display": {
 *           "name": "Mapper",
 *           "type": "mapper",
 *           "mapper_output_scope" : "action"
 *         }
 *      } ]
 *  }
 * @param activitySchema
 * @return {boolean}
 */
export function isMapperActivity(activitySchema): boolean {
  const hasOutputMapperDefinition = get(activitySchema, 'settings', []).find(
    isOutputMapperField
  );
  return Boolean(hasOutputMapperDefinition);
}

export function isOutputMapperField(inputDefinition): boolean {
  if (isObject(inputDefinition.display)) {
    return inputDefinition.display.type === 'mapper';
  }
  return false;
}
