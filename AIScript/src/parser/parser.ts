import { Program, Expression, BinaryExpression, NumericLiteral, Identifier, VariableDeclaration, NodeType, Statement } from "../core/core";

// Tipos de tokens que nosso Lexer irá gerar
enum TokenType {
    Number,
    Identifier,
    Equals,
    OpenParen,
    CloseParen,
    BinaryOperator,
    Let,
    Const,
    EOF, // End Of File
}

// Mapeamento de palavras-chave para tipos de token
const KEYWORDS: Record<string, TokenType> = {
    "let": TokenType.Let,
    "const": TokenType.Const,
};

// Interface para representar um Token
interface Token {
    value: string;
    type: TokenType;
}

// Função auxiliar para criar um token
function token(value = "", type: TokenType): Token {
    return { value, type };
}

// Função para verificar se um caractere é um operador
function isoperator(char: string): boolean {
    return char === '+' || char === '-' || char === '*' || char === '/';
}

// Função para verificar se um caractere é um dígito
function isint(char: string): boolean {
    const c = char.charCodeAt(0);
    const bounds = ['0'.charCodeAt(0), '9'.charCodeAt(0)];
    return c >= bounds[0] && c <= bounds[1];
}

// Função para verificar se um caractere é uma letra
function isalpha(char: string): boolean {
    return char.toUpperCase() !== char.toLowerCase();
}

// Função para verificar se um caractere é um espaço em branco
function isskippable(char: string): boolean {
    return char === ' ' || char === '\n' || char === '\t';
}

export default class Parser {
    private tokens: Token[] = [];

    // Método principal que transforma o código-fonte em uma lista de tokens
    private tokenize(sourceCode: string): Token[] {
        const tokens: Token[] = [];
        const src = sourceCode.split("");

        while (src.length > 0) {
            if (src[0] === '(') {
                tokens.push(token(src.shift(), TokenType.OpenParen));
            } else if (src[0] === ')') {
                tokens.push(token(src.shift(), TokenType.CloseParen));
            } else if (isoperator(src[0])) {
                tokens.push(token(src.shift(), TokenType.BinaryOperator));
            } else if (src[0] === '=') {
                tokens.push(token(src.shift(), TokenType.Equals));
            } else {
                // Lida com números de múltiplos dígitos
                if (isint(src[0])) {
                    let num = "";
                    while (src.length > 0 && isint(src[0])) {
                        num += src.shift();
                    }
                    tokens.push(token(num, TokenType.Number));
                } 
                // Lida com identificadores e palavras-chave
                else if (isalpha(src[0])) {
                    let ident = "";
                    while (src.length > 0 && isalpha(src[0])) {
                        ident += src.shift();
                    }

                    // Verifica se é uma palavra-chave
                    const reserved = KEYWORDS[ident];
                    if (reserved) {
                        tokens.push(token(ident, reserved));
                    } else {
                        tokens.push(token(ident, TokenType.Identifier));
                    }
                } 
                // Lida com espaços em branco
                else if (isskippable(src[0])) {
                    src.shift(); // Apenas ignora
                } 
                // Se não for nada conhecido, lança um erro
                else {
                    throw new Error(`Caractere não reconhecido encontrado no fonte: ${src[0]}`);
                }
            }
        }

        tokens.push(token("EndOfFile", TokenType.EOF));
        return tokens;
    }

    private at(): Token {
        return this.tokens[0];
    }

    private eat(): Token {
        return this.tokens.shift() as Token;
    }

    private expect(type: TokenType, err: string): Token {
        const prev = this.tokens.shift();
        if (!prev || prev.type !== type) {
            throw new Error(`Erro do Parser: ${err} - Esperando: ${type}, Recebido: ${prev?.type}`);
        }
        return prev;
    }

    public produceAST(sourceCode: string): Program {
        this.tokens = this.tokenize(sourceCode);
        const program: Program = {
            type: NodeType.Program,
            body: [],
        };

        // Parse até o final do arquivo
        while (this.at().type !== TokenType.EOF) {
            program.body.push(this.parse_stmt());
        }

        return program;
    }

    // Analisa as declarações (statements)
    private parse_stmt(): Statement {
        // Verifica se é uma declaração de variável
        switch (this.at().type) {
            case TokenType.Let:
            case TokenType.Const:
                return this.parse_var_declaration();
            default:
                return this.parse_expr();
        }
    }

    private parse_var_declaration(): Statement {
        const isConstant = this.eat().type == TokenType.Const;
        const identifier = this.expect(
            TokenType.Identifier,
            "Esperado nome da variável após a palavra-chave 'let' ou 'const'."
        ).value;

        this.expect(TokenType.Equals, "Esperado sinal de igual após o nome da variável.");

        const declaration = {
            type: NodeType.VariableDeclaration,
            identifier,
            constant: isConstant,
            value: this.parse_expr(),
        } as VariableDeclaration;

        return declaration;
    }

    // Analisa as expressões
    private parse_expr(): Expression {
        return this.parse_additive_expr();
    }

    // Lida com adição e subtração (ordem de precedência)
    private parse_additive_expr(): Expression {
        let left = this.parse_multiplicative_expr();

        while (this.at().value === '+' || this.at().value === '-') {
            const operator = this.eat().value;
            const right = this.parse_multiplicative_expr();
            left = {
                type: NodeType.BinaryExpression,
                left,
                right,
                operator,
            } as BinaryExpression;
        }

        return left;
    }

    // Lida com multiplicação e divisão
    private parse_multiplicative_expr(): Expression {
        let left = this.parse_primary_expr();

        while (this.at().value === '*' || this.at().value === '/') {
            const operator = this.eat().value;
            const right = this.parse_primary_expr();
            left = {
                type: NodeType.BinaryExpression,
                left,
                right,
                operator,
            } as BinaryExpression;
        }

        return left;
    }

    // Lida com as expressões mais simples (literais e identificadores)
    private parse_primary_expr(): Expression {
        const tk = this.at().type;

        switch (tk) {
            case TokenType.Identifier:
                return { type: NodeType.Identifier, symbol: this.eat().value } as Identifier;
            case TokenType.Number:
                return { type: NodeType.NumericLiteral, value: parseFloat(this.eat().value) } as NumericLiteral;
            default:
                throw new Error(`Token inesperado encontrado durante o parsing! Token: ${JSON.stringify(this.at())}`);
        }
    }
}