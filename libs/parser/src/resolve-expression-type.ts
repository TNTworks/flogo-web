import { parse } from './parse';
import { ExprStmt } from './ast';
import { isSuccessfulParse } from './parse-result-utils';

export function resolveExpressionType(text: string): string | null {
  const result = parse(text);
  if (!isSuccessfulParse(result)) {
    return null;
  }

  const ast = result.ast;
  if (ast.type === 'json') {
    return 'json';
  } else {
    const exprStmt = (<ExprStmt>ast).x;
    return translateExprStmtType(exprStmt.type);
  }
}

function translateExprStmtType(exprStmtType: string) {
  switch (exprStmtType) {
    case 'BasicLit':
      return 'literal';
    case 'UnaryExpr':
    case 'BinaryExpr':
    case 'CallExpr':
    case 'TernaryExpr':
    case 'ParenExpr':
      return 'expression';
    default:
      return 'attrAccess';
  }
}
