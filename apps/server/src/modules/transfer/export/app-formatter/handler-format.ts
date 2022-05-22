import { isEmpty } from 'lodash';
import {
  FlogoAppModel,
  Trigger,
  Handler,
  ContributionSchema,
  ContributionType,
  MapperUtils,
  TriggerSchema,
} from '@flogo-web/core';
import {
  ExportRefAgent,
  ExportActionAgent,
  transformConnectionTypeSettings,
} from '@flogo-web/lib-server/core';
import { HandlerExporterFn } from '../resource-exporter-fn';
import { ExportedResourceInfo } from './exported-resource-info';

interface HandlerFormatterParams {
  exportHandler: HandlerExporterFn;
  contributionSchemas: Map<string, ContributionSchema>;
  refAgent: ExportRefAgent;
  actionAgent: ExportActionAgent;
  getResourceInfo(oldResourceId): ExportedResourceInfo;
}

export function makeHandlerFormatter({
  exportHandler,
  contributionSchemas,
  refAgent,
  actionAgent,
  getResourceInfo,
}: HandlerFormatterParams) {
  return (trigger: Trigger) => {
    const triggerSchema = <TriggerSchema>contributionSchemas.get(trigger.ref);
    return (handler: Handler) => {
      const resourceInfo = getResourceInfo(handler.resourceId);
      const formattedHandler = preFormatHandler(
        handler,
        resourceInfo.ref,
        refAgent,
        triggerSchema
      );
      return exportHandler(resourceInfo.type, formattedHandler, {
        triggerSchema,
        resource: resourceInfo.resource,
        refAgent,
        actionAgent,
        internalHandler: {
          ...handler,
          resourceId: resourceInfo.resource.id,
        },
      });
    };
  };
}

export function preFormatHandler(
  handler: Handler,
  ref: string,
  refAgent: ExportRefAgent,
  triggerSchema: TriggerSchema
): FlogoAppModel.NewHandler {
  const { settings, actionMappings } = handler;
  const registerFunctions = (fn: string) => refAgent.registerFunctionName(fn);
  extractFunctions(actionMappings && actionMappings.input).forEach(registerFunctions);
  extractFunctions(actionMappings && actionMappings.output).forEach(registerFunctions);
  let handlerSettings = !isEmpty(settings) ? { ...settings } : undefined;
  if (handlerSettings) {
    handlerSettings = transformConnectionTypeSettings(
      handlerSettings,
      triggerSchema.handler?.settings,
      refAgent,
      false
    );
  }
  return {
    settings: handlerSettings,
    action: {
      ref: refAgent.getAliasRef(ContributionType.Action, ref),
      settings: null,
      ...(actionMappings ? effectiveActionMappings(actionMappings) : {}),
    },
  };
}

function effectiveActionMappings({ input, output }) {
  return {
    input: !isEmpty(input) ? input : undefined,
    output: !isEmpty(output) ? output : undefined,
  };
}

function extractFunctions(mappings: { [name: string]: any }): string[] {
  return !isEmpty(mappings)
    ? MapperUtils.functions.parseAndExtractReferencesInMappings(mappings)
    : [];
}
