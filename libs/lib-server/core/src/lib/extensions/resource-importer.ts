import {
  Resource,
  Handler,
  ContributionSchema,
  FlogoAppModel,
  ContributionType,
} from '@flogo-web/core';

export interface ResourceImportContext {
  contributions: Map<string, ContributionSchema>;
  normalizedTriggerIds: Map<string, string>;
  normalizedResourceIds: Map<string, string>;
  importsRefAgent: ImportsRefAgent;
  actionsManager: ImportActionsRegistry;
}

export interface HandlerImportContext {
  contributions: Map<string, ContributionSchema>;
  triggerSchema: ContributionSchema;
  rawHandler: FlogoAppModel.Handler;
  actionsManager: ImportActionsRegistry;
}

export interface ResourceImporter<TResourceData = unknown> {
  resource(data: any, context: ResourceImportContext): Resource<TResourceData>;
  handler(data: any, context: HandlerImportContext): Handler;
}

/**
 * Helper to convert an aliased ref using `#ref` syntax to full package ref for example `github.com/project-flogo/`
 */
export interface ImportsRefAgent {
  /**
   * Translate aliased ref (`#ref`) to package ref `github.com/path/to/full/package-ref`
   *
   * @example
   *  if there is an import registered as "github.com/TNTworks/flogo-contrib/activity/rest"
   *  importAgent.getPackageRef(ContributionType.Activity, '#rest')
   *  // outputs github.com/TNTworks/flogo-contrib/activity/rest
   *
   *  @example
   *  if there is an import registered as "myAliasedLog github.com/TNTworks/flogo-contrib/activity/log"
   *  importAgent.getPackageRef(ContributionType.Activity, '#myAliasedLog')
   *  // outputs github.com/TNTworks/flogo-contrib/activity/log
   * @param contribType
   * @param aliasRef
   */
  getPackageRef(contribType: ContributionType, aliasRef: string): string;
}

/**
 * Helper to get the required action details for a handler associated with actionId
 * @example
 * App.json
 *  ```{
 *    ...,
 *    triggers: [
 *      handlers: [
 *        id: 'some-action-id'
 *      ]
 *    ],
 *    actions: [
 *      {
 *        id: 'some-action-id',
 *        ref: 'some-plugin-resource-ref'
 *        settings: {
 *          resourceMapping: 'resource-id',
 *          someOtherProperty: 'value'
 *        }
 *      }
 *    ],
 *  }```
 */
export interface ImportActionsRegistry {
  /**
   * Get the reference `ref` in the action definition entity for an action Id
   *
   * @example
   *  in the above example if we call
   *  actionsManager.getRefForId('some-action-id')
   *  // outputs 'some-plugin-resource-ref'
   *
   * @param actionId
   * @return referencePath
   */
  getRefForId(actionId: string): string;

  /**
   * Get the settings in the action definition entity for an action Id
   *
   * @example
   *  in the above example if we call
   *  actionsManager.getSettingsForId('some-action-id')
   *  // outputs  {
   *          resourceMapping: 'resource-id',
   *          someOtherProperty: 'value'
   *        }
   *
   * @param actionId
   * @return actionSettings
   */
  getSettingsForId(actionId: string): FlogoAppModel.Action['settings'];

  /**
   * Get the settings in the action definition entity for a resource id
   *
   * @example
   *  in the above example if we call
   *  actionsManager.getSettingsForResourceId('resource-id')
   *  // outputs {
   *          resourceMapping: 'resource-id',
   *          someOtherProperty: 'value'
   *        }
   *
   * @param resourceId Generally will be of format `res://..`
   * @param propertyName property name which holds the resource id. We need this as plugin knows which property contains the resource id.
   * @return actionSettings
   */
  getSettingsForResourceId(
    resourceId: string,
    propertyName: string
  ): FlogoAppModel.Action['settings'];
}
