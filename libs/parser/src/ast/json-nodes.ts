import { Node } from './node';

import { Expr } from './expr-nodes';
import { AstNodeType } from './node-type';

export type ValueNode = ObjectNode | ArrayNode | LiteralNode | StringTemplateNode;

export interface JsonRootNode extends Node {
  type: AstNodeType.JsonRoot;
  value: ObjectNode | ArrayNode;
}

export interface ObjectNode extends Node {
  type: AstNodeType.JsonObject;
  children: PropertyNode[];
}

export interface ArrayNode extends Node {
  type: AstNodeType.JsonArray;
  children: ValueNode[];
}

export interface PropertyNode {
  type: AstNodeType.JsonProperty;
  key: string;
  value: ValueNode;
}

export interface LiteralNode {
  type: AstNodeType.JsonLiteral;
  value: any;
  kind: string;
  raw: string;
}

export interface StringTemplateNode {
  type: AstNodeType.StringTemplate;
  expression: Expr;
}
