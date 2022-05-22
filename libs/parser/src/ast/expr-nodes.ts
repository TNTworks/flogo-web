/**
 * Ast nodes for expressions.
 * Based on golang's AST classes:
 * https://godoc.org/go/ast
 */
import { Node } from './node';
import { AstNodeType } from './node-type';

export type Expr =
  | SelectorExpr
  | ScopeResolver
  | IndexExpr
  | CallExpr
  | UnaryExpr
  | BinaryExpr
  | TernaryExpr
  | Identifier
  | BasicLit;

export interface ExprStmt {
  type: AstNodeType.ExprStmt;
  // we call it "x" because that's the way golang's AST does it
  x: Expr;
}

export interface BasicLit extends Node {
  type: AstNodeType.BasicLit;
  kind: string;
  value: any;
  raw: string;
}

export interface Identifier extends Node {
  type: AstNodeType.Identifier;
  name: string;
}

// a.b.c => (x=expr(a.b); sel='c')
export interface SelectorExpr extends Node {
  type: AstNodeType.SelectorExpr;
  x: Expr;
  sel: string;
}

// a.b[0] => (x=expr(a.b); index=0)
export interface IndexExpr extends Node {
  type: AstNodeType.IndexExpr;
  x: Expr;
  index: number;
}

export interface PropAccessor extends Node {
  type: AstNodeType.PropAccessor;
  x: Expr;
  value: string;
}

export interface CallExpr extends Node {
  type: AstNodeType.CallExpr;
  fun: Expr;
  args: Expr[];
}

// flogo specific
// example: $activity[my_act] -> { name: 'activity'; selector: 'my_act' }
// example: $. -> { }
//
export interface ScopeResolver extends Node {
  type: AstNodeType.ScopeResolver;
  name?: string;
  sel?: string;
}

// !a => (operator="!"; x="a")
export interface UnaryExpr extends Node {
  type: AstNodeType.UnaryExpr;
  operator: string;
  x: Expr;
}

// a > b => (x="a"; operator=">"; y="b" )
export interface BinaryExpr extends Node {
  type: AstNodeType.BinaryExpr;
  x: Expr;
  operator: string;
  y: Expr;
}

// a ? b : c => (condition=a, body=b, else=c)
export interface TernaryExpr extends Node {
  type: AstNodeType.TernaryExpr;
  condition: Expr;
  consequent: Expr;
  alternate: Expr;
}

export interface ParenExpr extends Node {
  type: AstNodeType.ParenExpr;
  expr: Expr;
}
