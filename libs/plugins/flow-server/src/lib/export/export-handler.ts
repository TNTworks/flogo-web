import { FlogoAppModel, createResourceUri } from '@flogo-web/core';
import { HandlerExportContext } from '@flogo-web/lib-server/core';

export function exportHandler(
  exportedHandler: FlogoAppModel.NewHandler,
  context: HandlerExportContext
): FlogoAppModel.NewHandler {
  exportedHandler.action.settings = {
    flowURI: createResourceUri(context.internalHandler.resourceId),
  };
  return exportedHandler;
}
