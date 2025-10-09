import { Program, Expression, BinaryExpression, NumericLiteral, Identifier, VariableDeclaration, NodeType, Statement, CallExpression, ArrayLiteral, MemberExpression } from "../core/core";

// Tipos de tokens que nosso Lexer irá gerar
enum TokenType {
    Number,
    Identifier,
    Equals,
    OpenParen,
    CloseParen,
    OpenBracket,
    CloseBracket,
    Comma,
    BinaryOperator,
    Let,
    Const,
    At,
    Dot, // Adicionado para o acesso de membro
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
            } else if (src[0] === '[') {
                tokens.push(token(src.shift(), TokenType.OpenBracket));
            } else if (src[0] === ']') {
                tokens.push(token(src.shift(), TokenType.CloseBracket));
            } else if (src[0] === ',') {
                tokens.push(token(src.shift(), TokenType.Comma));
            } else if (src[0] === '@') {
                tokens.push(token(src.shift(), TokenType.At));
            } else if (src[0] === '.') {
                tokens.push(token(src.shift(), TokenType.Dot));
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
        return this.parse_tensor_expr();
    }

    private parse_tensor_expr(): Expression {
        let left = this.parse_additive_expr();

        while (this.at().type === TokenType.At) {
            const operator = this.eat().value;
            const right = this.parse_additive_expr();
            left = {
                type: NodeType.BinaryExpression,
                left,
                right,
                operator,
            } as BinaryExpression;
        }

        return left;
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
        let left = this.parse_call_member_expr();

        while (this.at().value === '*' || this.at().value === '/') {
            const operator = this.eat().value;
            const right = this.parse_call_member_expr();
            left = {
                type: NodeType.BinaryExpression,
                left,
                right,
                operator,
            } as BinaryExpression;
        }

        return left;
    }

    private parse_call_member_expr(): Expression {
        const member = this.parse_member_expr();
    
        if (this.at().type == TokenType.OpenParen) {
            return this.parse_call_expr(member);
        }
    
        return member;
    }

    private parse_member_expr(): Expression {
        let object = this.parse_primary_expr();
    
        while (this.at().type === TokenType.Dot) {
            this.eat(); // eat dot
            const property = this.expect(TokenType.Identifier, "A propriedade de uma expressão de membro deve ser um identificador.").value;
            
            object = {
                type: NodeType.MemberExpression,
                object,
                property: { type: NodeType.Identifier, symbol: property } as Identifier,
                computed: false,
            } as MemberExpression;
        }
    
        return object;
    }

    private parse_call_expr(caller: Expression): Expression {
        let call_expr: Expression = {
            type: NodeType.CallExpression,
            caller,
            args: this.parse_args(),
        } as CallExpression;
    
        if (this.at().type == TokenType.OpenParen) {
            call_expr = this.parse_call_expr(call_expr);
        }
    
        return call_expr;
    }
    
    private parse_args(): Expression[] {
        this.expect(TokenType.OpenParen, "Esperado parêntese de abertura na chamada de função.");
        const args = this.at().type == TokenType.CloseParen
            ? []
            : this.parse_arguments_list();
        this.expect(TokenType.CloseParen, "Faltando parêntese de fechamento na lista de argumentos.");
        return args;
    }
    
    private parse_arguments_list(): Expression[] {
        const args = [this.parse_expr()];
        while (this.at().type == TokenType.Comma && this.eat()) {
            args.push(this.parse_expr());
        }
        return args;
    }

    // Lida com as expressões mais simples (literais e identificadores)
    private parse_primary_expr(): Expression {
        const tk = this.at().type;

        switch (tk) {
            case TokenType.Identifier:
                return { type: NodeType.Identifier, symbol: this.eat().value } as Identifier;
            case TokenType.Number:
                return { type: NodeType.NumericLiteral, value: parseFloat(this.eat().value) } as NumericLiteral;
            case TokenType.OpenBracket:
                return this.parse_array_expr();
            case TokenType.OpenParen:
                this.eat(); // come o parêntese de abertura
                const value = this.parse_expr();
                this.expect(TokenType.CloseParen, "Token inesperado dentro da expressão com parênteses. Esperado parêntese de fechamento.");
                return value;
            default:
                throw new Error(`Token inesperado encontrado durante o parsing! Token: ${JSON.stringify(this.at())}`);
        }
    }

    private parse_array_expr(): Expression {
        this.eat(); // come o colchete de abertura
        const elements: Expression[] = [];

        if (this.at().type !== TokenType.CloseBracket) {
            elements.push(this.parse_expr());
            while (this.at().type === TokenType.Comma) {
                this.eat(); // come a vírgula
                elements.push(this.parse_expr());
            }
        }

        this.expect(TokenType.CloseBracket, "Esperado colchete de fechamento após os elementos do array.");

        return { type: NodeType.ArrayLiteral, elements } as ArrayLiteral;
    }
}