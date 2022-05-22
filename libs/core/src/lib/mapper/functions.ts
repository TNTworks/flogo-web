import { isObject, isArray } from 'lodash';
import {
  ParseResult,
  parse,
  hasErrors,
  simpleWalker,
  ExprNodes,
  AstNodeType,
} from '@flogo-web/parser';
import { EXPR_PREFIX } from '../constants';

export function parseAndExtractReferences(expression: string): string[] {
  const parseResult = parse(expression);
  if (hasErrors(parseResult)) {
    throw new Error(
      `Could not extract references: found errors while parsing expression ${expression}`
    );
  }
  return extractReferences(parseResult);
}

export function extractReferences(parseResult: ParseResult): string[] {
  const functionNames = new Set<string>();
  simpleWalker.walk(parseResult.ast, {
    [AstNodeType.CallExpr]: (node: ExprNodes.CallExpr, visit) => {
      let functionName;
      if (node.fun.type === 'Identifier') {
        functionName = node.fun.name;
      } else if (node.fun.type === 'SelectorExpr') {
        const nameComponents = visit(node.fun, node);
        functionName = nameComponents ? nameComponents.join('.') : null;
      }

      if (functionName) {
        functionNames.add(functionName);
      }

      (node.args || []).forEach(arg => visit(arg, node));
    },
    [AstNodeType.SelectorExpr]: (node: ExprNodes.SelectorExpr, visit) => {
      if (node.x.type === 'Identifier') {
        return [node.x.name, node.sel];
      } else if (node.x.type === 'SelectorExpr') {
        const left = visit(node.x);
        if (left) {
          return [...visit(node.x), node.sel];
        }
      }
      return null;
    },
  });
  return Array.from(functionNames.values());
}

export function parseAndExtractReferencesInMappings(mappings: {
  [propertyName: string]: any;
}) {
  const functions = new Set<string>();
  const addToFunctions: (string) => void = (fn: string) => functions.add(fn);
  (function extract(current: any) {
    if (typeof current === 'string' && current.startsWith(EXPR_PREFIX)) {
      parseAndExtractReferences(current.substr(1)).forEach(addToFunctions);
    } else if (isArray(current)) {
      current.forEach(extract);
    } else if (isObject(current)) {
      Object.values(current).forEach(extract);
    }
  })(mappings);
  return Array.from(functions.values());
}
