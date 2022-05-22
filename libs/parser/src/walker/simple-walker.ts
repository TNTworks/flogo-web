import { Node, ExprNodes, JsonNodes, AstNodeType } from '../ast';

type VisitFn = (node: Node, context?: any) => any;
export interface SimpleVisitors {
  [nodeType: string]: (node: Node, visitNext: VisitFn, context?: any) => any;
}

export const simpleWalker = {
  walk(initialNode: Node, visitors: SimpleVisitors, initialState?: any): any {
    return (function visit(node, state) {
      if (!node || !node.type) {
        return state;
      }
      return visitors[node.type]
        ? visitors[node.type](node, visit, state)
        : defaultVisit(node, visit, state);
    })(initialNode, initialState);
  },
};

const visitEach = (nodes: Node[], visitFn: VisitFn, context) =>
  nodes
    ? nodes.reduce((currentContext, node) => visitFn(node, currentContext), context)
    : context;
function defaultVisit(node: Node, visitNext: VisitFn, context: any) {
  switch (node.type) {
    case AstNodeType.ExprStmt:
      context = visitNext((<ExprNodes.ExprStmt>node).x, context);
      break;
    case AstNodeType.SelectorExpr:
      context = visitNext((<ExprNodes.SelectorExpr>node).x, context);
      break;
    case AstNodeType.IndexExpr:
      context = visitNext((<ExprNodes.SelectorExpr>node).x, context);
      break;
    case AstNodeType.CallExpr:
      context = visitNext((<ExprNodes.CallExpr>node).fun, context);
      context = visitEach((<ExprNodes.CallExpr>node).args, visitNext, context);
      break;
    case AstNodeType.UnaryExpr:
      context = visitNext((<ExprNodes.UnaryExpr>node).x, context);
      break;
    case AstNodeType.BinaryExpr:
      context = visitNext((<ExprNodes.BinaryExpr>node).x, context);
      context = visitNext((<ExprNodes.BinaryExpr>node).y, context);
      break;
    case AstNodeType.TernaryExpr:
      context = visitNext((<ExprNodes.TernaryExpr>node).condition, context);
      context = visitNext((<ExprNodes.TernaryExpr>node).consequent, context);
      context = visitNext((<ExprNodes.TernaryExpr>node).alternate, context);
      break;
    case AstNodeType.ParenExpr:
      context = visitNext((<ExprNodes.ParenExpr>node).expr, context);
      break;
    case AstNodeType.JsonRoot:
      context = visitNext((<JsonNodes.JsonRootNode>node).value, context);
      break;
    case AstNodeType.JsonObject:
    case AstNodeType.JsonArray:
      context = visitEach(
        (<JsonNodes.ObjectNode | JsonNodes.ArrayNode>node).children,
        visitNext,
        context
      );
      break;
    case AstNodeType.JsonProperty:
      context = visitNext((<JsonNodes.PropertyNode>node).value);
      break;
    case AstNodeType.StringTemplate:
      context = visitNext((<JsonNodes.StringTemplateNode>node).expression, context);
      break;
  }
  return context;
}
