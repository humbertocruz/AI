import { Program, Statement, Expression, BinaryExpression, NumericLiteral, Identifier, VariableDeclaration, NodeType } from "../core/core";

export default class Transpiler {
    public transpile(ast: Program): string {
        let output = "";
        for (const statement of ast.body) {
            output += this.transpile_statement(statement);
        }
        return output;
    }

    private transpile_statement(statement: Statement): string {
        switch (statement.type) {
            case NodeType.VariableDeclaration:
                return this.transpile_variable_declaration(statement as VariableDeclaration);
            case NodeType.BinaryExpression:
                return this.transpile_expression(statement as Expression) + ";\n";
            case NodeType.NumericLiteral:
                return this.transpile_expression(statement as Expression) + ";\n";
            default:
                console.error(`Tipo de declaração não suportado para transpilação: ${statement.type}`);
                return "";
        }
    }

    private transpile_variable_declaration(declaration: VariableDeclaration): string {
        const keyword = declaration.constant ? "const" : "let";
        const value = declaration.value ? ` = ${this.transpile_expression(declaration.value)}` : "";
        return `${keyword} ${declaration.identifier}${value};\n`;
    }

    private transpile_expression(expression: Expression): string {
        switch (expression.type) {
            case NodeType.Identifier:
                return (expression as Identifier).symbol;
            case NodeType.NumericLiteral:
                return (expression as NumericLiteral).value.toString();
            case NodeType.BinaryExpression:
                const binExpr = expression as BinaryExpression;
                const left = this.transpile_expression(binExpr.left);
                const right = this.transpile_expression(binExpr.right);
                return `${left} ${binExpr.operator} ${right}`;
            default:
                console.error(`Tipo de expressão não suportado para transpilação: ${expression.type}`);
                return "";
        }
    }
}