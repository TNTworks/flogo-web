import {
  Resource,
  FlogoAppModel,
  Handler,
  ContributionSchema,
  ContributionType,
} from '@flogo-web/core';

export interface ResourceConfiguration {
  ref: string;
  resourcePrefix: string;
}

export interface ResourceExportContext {
  contributions: Map<string, ContributionSchema>;
  resourceIdReconciler: Map<string, Resource>;
  refAgent: ExportRefAgent;
  actionAgent: ExportActionAgent;
}

export interface HandlerExportContext {
  triggerSchema: ContributionSchema;
  resource: FlogoAppModel.Resource;
  internalHandler: Handler;
  refAgent: ExportRefAgent;
  actionAgent: ExportActionAgent;
}

export interface ResourceExporter<TResourceData = unknown> {
  resource(
    resource: Resource<TResourceData>,
    context: ResourceExportContext
  ): FlogoAppModel.Resource;
  handler(
    handler: FlogoAppModel.NewHandler,
    context: HandlerExportContext
  ): FlogoAppModel.NewHandler;
}

export interface ExportRefAgent {
  getAliasRef(contribType: ContributionType, packageRef: string): string | undefined;
  registerFunctionName(functionName: string): void;
}

export interface ExportActionAgent {
  registerAction<ActionSettings = unknown>(
    ref: string,
    resourceId: string,
    settings: ActionSettings
  ): void;
  getActionId(resourceId: string): string | undefined;
}
