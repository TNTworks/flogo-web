import { fromPairs } from 'lodash';
import { ExprNodes } from '@flogo-web/parser';
import { SettingValue } from '../settings-value';
import { isResolverExpression } from './is-resolver-expression';
import { ErrorTypes } from './error-types';

const RESOLVER_NAME_ENVIRONMENT = 'env';
const RESOLVER_NAME_PROPERTY = 'property';
const ALLOWED_RESOLVERS = [RESOLVER_NAME_ENVIRONMENT, RESOLVER_NAME_PROPERTY];

export function validateExpression(settingValue: SettingValue) {
  if (!settingValue || !isResolverExpression(settingValue.parsedValue)) {
    return null;
  }
  let errors = [];
  const parsingErrors = getParsingErrors(settingValue);
  if (parsingErrors) {
    errors.push([ErrorTypes.SyntaxError, { parsingErrors }]);
  } else {
    errors = [...errors, ...validateResolver(settingValue)];
  }
  errors = errors.filter(Boolean);
  return errors.length > 0 ? fromPairs(errors) : null;
}

function getParsingErrors(value: SettingValue) {
  const parsingDetails = value.parsingDetails;
  if (!parsingDetails) {
    return null;
  }
  let parsingErrors = [];
  if (parsingDetails.lexErrors && parsingDetails.lexErrors.length > 0) {
    parsingErrors = [...parsingErrors, parsingDetails.lexErrors];
  }
  if (parsingDetails.parseErrors && parsingDetails.parseErrors.length > 0) {
    parsingErrors = [...parsingErrors, parsingDetails.parseErrors];
  }
  return parsingErrors.length > 0 ? parsingErrors : null;
}

function validateResolver(value: SettingValue) {
  const errors = [];
  let resolverDetails: ExprNodes.ScopeResolver;
  if (
    value.parsingDetails &&
    value.parsingDetails.ast &&
    value.parsingDetails.ast.type === 'ScopeResolver'
  ) {
    resolverDetails = value.parsingDetails.ast as ExprNodes.ScopeResolver;
  } else {
    return [];
  }
  const resolverName = resolverDetails.name || '';
  if (!ALLOWED_RESOLVERS.includes(resolverName)) {
    errors.push([
      ErrorTypes.UnknownResolverName,
      { name: resolverName, allowed: [...ALLOWED_RESOLVERS] },
    ]);
  }
  const elementToResolve = resolverDetails.sel;
  if (elementToResolve) {
    // todo: check if resolvable property exists for $property resolvers example: check if myAppProp exists for $property[myProp]
  } else {
    errors.push([[ErrorTypes.MissingResolvableProperty], { resolverName }]);
  }
  return errors;
}
