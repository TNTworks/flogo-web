import * as JsonNodes from './json-nodes';
import * as ExprNodes from './expr-nodes';

export type RootAstNode = JsonNodes.JsonRootNode | ExprNodes.ExprStmt;
