export enum NodeType {
    Program = "Program",
    NumericLiteral = "NumericLiteral",
    Identifier = "Identifier",
    BinaryExpression = "BinaryExpression",
    VariableDeclaration = "VariableDeclaration",
    CallExpression = "CallExpression",
    ArrayLiteral = "ArrayLiteral",
    MemberExpression = "MemberExpression",
}

export interface Statement {
    type: NodeType;
}

export interface Program extends Statement {
    type: NodeType.Program;
    body: Statement[];
}

export interface VariableDeclaration extends Statement {
    type: NodeType.VariableDeclaration;
    constant: boolean;
    identifier: string;
    value?: Expression;
}

export interface Expression extends Statement {}

export interface MemberExpression extends Expression {
    type: NodeType.MemberExpression;
    object: Expression;
    property: Expression;
    computed: boolean;
}

export interface BinaryExpression extends Expression {
    type: NodeType.BinaryExpression;
    left: Expression;
    right: Expression;
    operator: string;
}

export interface CallExpression extends Expression {
    type: NodeType.CallExpression;
    caller: Expression;
    args: Expression[];
}

export interface Identifier extends Expression {
    type: NodeType.Identifier;
    symbol: string;
}

export interface NumericLiteral extends Expression {
    type: NodeType.NumericLiteral;
    value: number;
}

export interface ArrayLiteral extends Expression {
    type: NodeType.ArrayLiteral;
    elements: Expression[];
}