import { isString, isPlainObject } from 'lodash';
import { parse } from '@flogo-web/parser';
import { EXPR_PREFIX, FlogoAppModel, Handler } from '@flogo-web/core';
import { MAPPING_EXPRESSION_TYPE, EXPRESSION_TYPE } from '@flogo-web/lib-server/core';

const CURRENT_SCOPE_RESOLVER = '$';
const normalizeAndAccumulateMapping = (reducedMappings, mapping) => {
  mapping = prefixWithScopeResolver(mapping);
  let value = mapping.value;
  if (mapping.type !== MAPPING_EXPRESSION_TYPE.LITERAL && !isPlainObject(value)) {
    value = EXPR_PREFIX + value;
  }
  reducedMappings[mapping.mapTo] = value;
  return reducedMappings;
};

function hasLegacyMappings(
  handler: FlogoAppModel.Handler
): handler is FlogoAppModel.LegacyHandler {
  const action = handler.action && (<FlogoAppModel.LegacyHandler>handler).action;
  return action && action.mappings && !!(action.mappings.input || action.mappings.output);
}

function hasNewMappings(
  handler: FlogoAppModel.Handler
): handler is FlogoAppModel.NewHandler {
  const action = handler.action && (<FlogoAppModel.NewHandler>handler).action;
  return action && !!(action.input || action.output);
}

type HandlerWithActionMappings = FlogoAppModel.Handler & {
  actionMappings?: Handler['actionMappings'];
};
export function normalizeHandlerMappings(
  rawHandler: FlogoAppModel.Handler
): HandlerWithActionMappings {
  let handler: HandlerWithActionMappings = rawHandler;
  if (hasNewMappings(rawHandler)) {
    const { input, output } = rawHandler.action;
    handler = { ...rawHandler, actionMappings: { input, output } };
    delete handler.action.input;
    delete handler.action.output;
  } else if (hasLegacyMappings(rawHandler)) {
    let { input, output } = rawHandler.action.mappings;
    input = input && input.reduce(normalizeAndAccumulateMapping, {});
    output = output && output.reduce(normalizeAndAccumulateMapping, {});
    handler = { ...rawHandler, actionMappings: { input, output } };
    delete (handler as FlogoAppModel.LegacyHandler).action.mappings;
  }
  return handler;
}

/**
 * @param {object} mapping
 * @param {any} mapping.value
 * @param {string} mapping.type
 * @param {string} mapping.mapTo
 * @return {object} mapping
 * */
export function prefixWithScopeResolver(mapping) {
  const isProcessable =
    isString(mapping.value) &&
    (mapping.type === MAPPING_EXPRESSION_TYPE.ASSIGN ||
      mapping.type === EXPRESSION_TYPE.ASSIGN);
  if (isProcessable && shouldPrefixWithScopeResolver(mapping.value)) {
    const value = `${CURRENT_SCOPE_RESOLVER}.${mapping.value.trim()}`;
    return { ...mapping, value };
  }
  return mapping;
}

function shouldPrefixWithScopeResolver(expression) {
  const { ast } = parse(expression);
  if (ast && ast.type === 'ExprStmt') {
    const { x: exprNode } = ast as any; // as ExprStmt;
    const headNode = getAssignExpressionHead(exprNode);
    return !!headNode && headNode.type === 'Identifier';
  }
  return false;
}

function getAssignExpressionHead(node) {
  let currentNode = node;
  while (currentNode) {
    switch (currentNode.type) {
      case 'Identifier':
      case 'ScopeResolver':
        // terminal nodes, we reached the head
        return currentNode;
      case 'SelectorExpr':
      case 'IndexExpr':
        currentNode = currentNode.x;
        break;
      default:
        // not an assign expression
        return null;
    }
  }
  return null;
}
