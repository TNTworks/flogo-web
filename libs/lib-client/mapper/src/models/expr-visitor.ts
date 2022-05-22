/**  Sample
 let expr = `X.String.concat("a",String.concat("b",String.concat("c","d")))`;
 let jsonData = `{
   "type": "Program",
   "body": [
      {
         "type": "ExpressionStatement",
         "expression": {
            "type": "CallExpression",
            "callee": {
               "type": "MemberExpression",
               "object": {
                  "type": "MemberExpression",
                  "object": {
                     "type": "Identifier",
                     "name": "X",
                     "location": {
                        "start": {
                           "offset": 0,
                           "line": 1,
                           "column": 1
                        },
                        "end": {
                           "offset": 1,
                           "line": 1,
                           "column": 2
                        }
                     }
                  },
                  "property": {
                     "type": "Identifier",
                     "name": "String",
                     "location": {
                        "start": {
                           "offset": 2,
                           "line": 1,
                           "column": 3
                        },
                        "end": {
                           "offset": 8,
                           "line": 1,
                           "column": 9
                        }
                     }
                  },
                  "computed": false,
                  "location": {
                     "start": {
                        "offset": 0,
                        "line": 1,
                        "column": 1
                     },
                     "end": {
                        "offset": 15,
                        "line": 1,
                        "column": 16
                     }
                  }
               },
               "property": {
                  "type": "Identifier",
                  "name": "concat",
                  "location": {
                     "start": {
                        "offset": 9,
                        "line": 1,
                        "column": 10
                     },
                     "end": {
                        "offset": 15,
                        "line": 1,
                        "column": 16
                     }
                  }
               },
               "computed": false,
               "location": {
                  "start": {
                     "offset": 0,
                     "line": 1,
                     "column": 1
                  },
                  "end": {
                     "offset": 15,
                     "line": 1,
                     "column": 16
                  }
               }
            },
            "arguments": [
               {
                  "type": "Literal",
                  "value": "a",
                  "location": {
                     "start": {
                        "offset": 16,
                        "line": 1,
                        "column": 17
                     },
                     "end": {
                        "offset": 19,
                        "line": 1,
                        "column": 20
                     }
                  }
               },
               {
                  "type": "CallExpression",
                  "callee": {
                     "type": "MemberExpression",
                     "object": {
                        "type": "Identifier",
                        "name": "String",
                        "location": {
                           "start": {
                              "offset": 20,
                              "line": 1,
                              "column": 21
                           },
                           "end": {
                              "offset": 26,
                              "line": 1,
                              "column": 27
                           }
                        }
                     },
                     "property": {
                        "type": "Identifier",
                        "name": "concat",
                        "location": {
                           "start": {
                              "offset": 27,
                              "line": 1,
                              "column": 28
                           },
                           "end": {
                              "offset": 33,
                              "line": 1,
                              "column": 34
                           }
                        }
                     },
                     "computed": false,
                     "location": {
                        "start": {
                           "offset": 20,
                           "line": 1,
                           "column": 21
                        },
                        "end": {
                           "offset": 33,
                           "line": 1,
                           "column": 34
                        }
                     }
                  },
                  "arguments": [
                     {
                        "type": "Literal",
                        "value": "b",
                        "location": {
                           "start": {
                              "offset": 34,
                              "line": 1,
                              "column": 35
                           },
                           "end": {
                              "offset": 37,
                              "line": 1,
                              "column": 38
                           }
                        }
                     },
                     {
                        "type": "CallExpression",
                        "callee": {
                           "type": "MemberExpression",
                           "object": {
                              "type": "Identifier",
                              "name": "String",
                              "location": {
                                 "start": {
                                    "offset": 38,
                                    "line": 1,
                                    "column": 39
                                 },
                                 "end": {
                                    "offset": 44,
                                    "line": 1,
                                    "column": 45
                                 }
                              }
                           },
                           "property": {
                              "type": "Identifier",
                              "name": "concat",
                              "location": {
                                 "start": {
                                    "offset": 45,
                                    "line": 1,
                                    "column": 46
                                 },
                                 "end": {
                                    "offset": 51,
                                    "line": 1,
                                    "column": 52
                                 }
                              }
                           },
                           "computed": false,
                           "location": {
                              "start": {
                                 "offset": 38,
                                 "line": 1,
                                 "column": 39
                              },
                              "end": {
                                 "offset": 51,
                                 "line": 1,
                                 "column": 52
                              }
                           }
                        },
                        "arguments": [
                           {
                              "type": "Literal",
                              "value": "c",
                              "location": {
                                 "start": {
                                    "offset": 52,
                                    "line": 1,
                                    "column": 53
                                 },
                                 "end": {
                                    "offset": 55,
                                    "line": 1,
                                    "column": 56
                                 }
                              }
                           },
                           {
                              "type": "Literal",
                              "value": "d",
                              "location": {
                                 "start": {
                                    "offset": 56,
                                    "line": 1,
                                    "column": 57
                                 },
                                 "end": {
                                    "offset": 59,
                                    "line": 1,
                                    "column": 60
                                 }
                              }
                           }
                        ]
                     }
                  ]
               }
            ]
         }
      }
   ]
}`;
 */

export interface INode {
  accept(visitor: INodeVisitor): void;

  getParentNode(): INode | null;
}

export interface IPosition {
  offset: number;
  line: number;
  column: number;
}

export interface ILocation {
  start: Position;
  end: Position;
}

export interface INamedNode extends INode {
  getName(): string;
}

export interface IProgramNode extends INode {
  getBody(): any[];
}

export interface IExpressionStatementNode extends INode {
  getExpression(): any;
}

export interface IExpressionNode extends INamedNode {
  getExpression(): INode;
}

export interface IMemberExpressionNode extends IExpressionNode, ILocatable {
  getObject(): any;

  getProperty(): any;

  getMemberExpression(): string;
}

export interface ICallExpressionNode extends IExpressionNode {
  getCallee(): any;

  getArguments(): any;
}

// tslint:disable-next-line:no-empty-interface
export interface IIdentifierNode extends IExpressionNode {}

export interface ILiteralNode extends IExpressionNode {
  getValue(): string;
}

export interface ILocatable {
  getLocation(): ILocation;
}

export abstract class BaseNode implements INode {
  constructor(
    private name: string,
    private parentNode: INode,
    private location?: ILocation
  ) {}

  getName() {
    return this.name;
  }

  getLocation() {
    return this.location;
  }

  setName(name: string): void {
    this.name = name;
  }

  getParentNode() {
    return this.parentNode;
  }

  abstract accept(visitor: INodeVisitor): void;
}

export abstract class BaseExpressionNode extends BaseNode implements IExpressionNode {
  abstract getExpression(): INode;
}

export class ProgramNode extends BaseNode implements IProgramNode {
  constructor(private body: any[], parentNode: INode) {
    super('Program', parentNode, null);
  }

  getBody(): any[] {
    return this.body;
  }

  accept(visitor: INodeVisitor) {
    visitor.visitEnterProgram(this);
    if (this.body) {
      if (Array.isArray(this.body)) {
        for (const bn of this.body) {
          const node = NodeFactory.createNode(bn, this);
          if (node) {
            node.accept(visitor);
          }
        }
      }
    }
    visitor.visitLeaveProgram(this);
  }
}

export class ExpressionStatementNode extends BaseNode {
  constructor(private expression: any, parentNode: INode) {
    super('ExpressionStatement', parentNode, null);
  }

  getExpression(): any {
    return this.expression;
  }

  accept(visitor: INodeVisitor) {
    visitor.visitEnterExpressionStatement(this);
    if (this.expression) {
      const node = NodeFactory.createNode(this.expression, this);
      node.accept(visitor);
    }
    visitor.visitLeaveExpressionStatement(this);
  }
}

export type IArgumentNode = ICallExpressionNode | ILiteralNode | IIdentifierNode;

export class ArgumentNode implements INode {
  constructor(private node: IArgumentNode, private parentNode: INode) {}

  accept(visitor: INodeVisitor) {
    visitor.visitEnterArgument(this);
    this.node.accept(visitor);
    visitor.visitLeaveArgument(this);
  }

  getParentNode() {
    return this.parentNode;
  }
}

export class CallExpressionNode extends BaseExpressionNode
  implements ICallExpressionNode {
  expression: INode;

  constructor(private callee: any, private args: any, parentNode: INode) {
    super('CallExpression', parentNode, null);
  }

  getCallee() {
    return this.callee;
  }

  getArguments() {
    return this.args;
  }

  getExpression(): INode {
    return this.expression;
  }

  getCallExpression(): string {
    let names = '';
    let node: INode = this.expression;
    while (node) {
      if (node instanceof BaseExpressionNode) {
        const name = (<INamedNode>node).getName();
        /**
         * "" + "."+ concat
         * ".String"+".concat"
         * ".X" + ".String.concat"
         */
        names = '.' + name + names;
      }
      node = (<IExpressionNode>node).getExpression();
    }
    return names.slice(1);
  }

  accept(visitor: INodeVisitor) {
    visitor.visitEnterCallExpression(this);
    if (this.callee) {
      const node = NodeFactory.createNode(this.callee, this);
      if (node) {
        if (node instanceof MemberExpressionNode) {
          this.expression = node;
        }
        node.accept(visitor);
      }
    }
    if (this.args && Array.isArray(this.args)) {
      for (const arg of this.args) {
        const node = NodeFactory.createNode(arg, this);
        if (node) {
          const anode = NodeFactory.createNode({ type: 'Argument', arg: node }, this);
          if (anode) {
            anode.accept(visitor);
          }
        }
      }
    }
    visitor.visitLeaveCallExpression(this);
  }
}

export class MemberExpressionNode extends BaseExpressionNode
  implements IMemberExpressionNode {
  expression: INode;

  constructor(
    private object: any,
    private property: any,
    private computed: boolean,
    parentNode: INode,
    location: ILocation
  ) {
    super('MemberExpression', parentNode, location);
  }

  getObject(): any {
    return this.object;
  }

  getProperty(): any {
    return this.property;
  }

  getExpression(): INode {
    return this.expression;
  }

  getMemberExpression(): string {
    let names = '';
    let node: INode = this.expression;
    while (node) {
      if (node instanceof BaseExpressionNode) {
        const name = (<INamedNode>node).getName();
        /**
         * "" + "."+ concat
         * ".String"+".concat"
         * ".X" + ".String.concat"
         */
        names = '.' + name + names;
      }
      node = (<IExpressionNode>node).getExpression();
    }
    return names.slice(1);
  }

  accept(visitor: INodeVisitor) {
    visitor.visitEnterMemberExpression(this);
    if (this.object) {
      const node = NodeFactory.createNode(this.object, this);
      if (node) {
        this.expression = node;
        node.accept(visitor);
      }
    }
    if (this.property) {
      const node = NodeFactory.createNode(this.property, this);
      if (node) {
        if (node instanceof BaseExpressionNode) {
          this.setName(node.getName());
        }
        node.accept(visitor);
      }
    }
    visitor.visitLeaveMemberExpression(this);
  }
}

export class IdentifierNode extends BaseExpressionNode implements IIdentifierNode {
  constructor(private iname: string, parentNode: INode, private ilocation: ILocation) {
    super(iname, parentNode, ilocation);
  }

  getName(): string {
    return this.iname;
  }

  getExpression(): INode {
    return null;
  }

  accept(visitor: INodeVisitor) {
    visitor.visitEnterIdentifier(this);
    visitor.visitLeaveIdentifier(this);
  }
}

export class LiteralNode extends BaseExpressionNode implements ILiteralNode {
  constructor(private value: string, parentNode: INode, location: ILocation) {
    super(value, parentNode, location);
  }

  getValue() {
    return this.value;
  }

  getExpression(): INode {
    return null;
  }

  accept(visitor: INodeVisitor) {
    visitor.visitEnterLiteral(this);
    visitor.visitLeaveLiteral(this);
  }
}

export type NodeTypes =
  | IProgramNode
  | IExpressionStatementNode
  | ICallExpressionNode
  | IMemberExpressionNode
  | ICallExpressionNode
  | ArgumentNode
  | IIdentifierNode
  | ILiteralNode;

export class NodeFactory {
  static createNode(obj: any, parent?: INode): INode {
    if (obj.type === 'Program') {
      return new ProgramNode(obj.body, parent);
    } else if (obj.type === 'ExpressionStatement') {
      return new ExpressionStatementNode(obj.expression, parent);
    } else if (obj.type === 'CallExpression') {
      return new CallExpressionNode(obj.callee, obj.arguments, parent);
    } else if (obj.type === 'Argument') {
      return new ArgumentNode(obj.arg, parent);
    } else if (obj.type === 'MemberExpression') {
      return new MemberExpressionNode(
        obj.object,
        obj.property,
        obj.computed,
        parent,
        obj.location
      );
    } else if (obj.type === 'Identifier') {
      return new IdentifierNode(obj.name, parent, obj.location);
    } else if (obj.type === 'Literal') {
      return new LiteralNode(obj.value, parent, obj.location);
    }
  }
}

export interface INodeVisitor {
  visitEnterProgram(node: IProgramNode);

  visitEnterExpressionStatement(node: IExpressionStatementNode);

  visitEnterArgument(node: ArgumentNode);

  visitEnterCallExpression(node: ICallExpressionNode);

  visitEnterMemberExpression(node: IMemberExpressionNode);

  visitEnterIdentifier(node: IIdentifierNode);

  visitEnterLiteral(node: ILiteralNode);

  visitLeaveProgram(node: IProgramNode);

  visitLeaveExpressionStatement(node: IExpressionStatementNode);

  visitLeaveArgument(node: ArgumentNode);

  visitLeaveCallExpression(node: ICallExpressionNode);

  visitLeaveMemberExpression(node: IMemberExpressionNode);

  visitLeaveIdentifier(node: IIdentifierNode);

  visitLeaveLiteral(node: ILiteralNode);
}

export abstract class NodeVisitor implements INodeVisitor {
  abstract visitEnterProgram(node: ProgramNode);

  abstract visitEnterExpressionStatement(node: ExpressionStatementNode);

  abstract visitEnterCallExpression(node: CallExpressionNode);

  abstract visitEnterArgument(node: ArgumentNode);

  abstract visitEnterMemberExpression(node: MemberExpressionNode);

  abstract visitEnterIdentifier(node: IdentifierNode);

  abstract visitEnterLiteral(node: LiteralNode);

  abstract visitLeaveProgram(node: ProgramNode);

  abstract visitLeaveExpressionStatement(node: ExpressionStatementNode);

  abstract visitLeaveCallExpression(node: CallExpressionNode);

  abstract visitLeaveArgument(node: ArgumentNode);

  abstract visitLeaveMemberExpression(node: MemberExpressionNode);

  abstract visitLeaveIdentifier(node: IdentifierNode);

  abstract visitLeaveLiteral(node: LiteralNode);
}

export class CodeVisitor extends NodeVisitor {
  visitEnterProgram(node: ProgramNode) {
    console.log('Enter Program...');
    // console.log(node);
  }

  visitEnterExpressionStatement(node: ExpressionStatementNode) {
    console.log('Enter ExpressionStatement');
    // console.log(node);
  }

  visitEnterCallExpression(node: CallExpressionNode) {
    console.log('Enter Call Expression...' + node.getCallExpression());
    // console.log(node);
  }

  visitEnterArgument(node: ArgumentNode) {
    console.log('Enter Argument...');
    // console.log(node);
  }

  visitEnterMemberExpression(node: MemberExpressionNode) {
    console.log(
      'Enter Member Expression...' + node.getName() + '  ' + node.getMemberExpression()
    );
    // console.log(node);
  }

  visitEnterIdentifier(node: IdentifierNode) {
    console.log('Enter Identifier...' + node.getName());
    // console.log(node);
  }

  visitEnterLiteral(node: LiteralNode) {
    console.log('Enter Literal...' + node.getName());
    // console.log(node);
  }

  visitLeaveProgram(node: ProgramNode) {
    console.log('Leave Program...');
    // console.log(node);
  }

  visitLeaveExpressionStatement(node: ExpressionStatementNode) {
    console.log('Leave ExpressionStatement');
    // console.log(node);
  }

  visitLeaveCallExpression(node: CallExpressionNode) {
    console.log('Leave Call Expression...' + node.getCallExpression());
    // console.log(node);
  }

  visitLeaveArgument(node: ArgumentNode) {
    console.log('Leave Argument...');
    // console.log(node);
  }

  visitLeaveMemberExpression(node: MemberExpressionNode) {
    console.log('Leave Member Expression...' + node.getName());
    // console.log(node);
  }

  visitLeaveIdentifier(node: IdentifierNode) {
    console.log('Leave Identifier...' + node.getName());
    // console.log(node);
  }

  visitLeaveLiteral(node: LiteralNode) {
    console.log('Leave Literal...' + node.getName());
    // console.log(node);
  }
}
