import {
  HandlerImportContext,
  parseResourceIdFromResourceUri,
} from '@flogo-web/lib-server/core';
import { FlogoAppModel } from '@flogo-web/core';
import { FLOW_POINTER } from '../constants';

const isLegacyHandler = (h: FlogoAppModel.Handler): h is FlogoAppModel.LegacyHandler =>
  !!(<FlogoAppModel.LegacyHandler>h).action.data;

export function importHandler(handler, context: HandlerImportContext) {
  const { rawHandler } = context;
  let resourceURI;
  if (isLegacyHandler(rawHandler)) {
    resourceURI = rawHandler.action.data[FLOW_POINTER];
  } else {
    resourceURI = (<FlogoAppModel.NewHandler>rawHandler).action.settings[FLOW_POINTER];
  }
  handler.resourceId = parseResourceIdFromResourceUri(resourceURI);
  return handler;
}
