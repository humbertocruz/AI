import Parser from './parser/parser';
import Transpiler from './transpiler/transpiler';

const sourceCode = "let x = 10 + 20";

const parser = new Parser();
const ast = parser.produceAST(sourceCode);

const transpiler = new Transpiler();
const tsCode = transpiler.transpile(ast);

console.log(`Código transpilado: ${tsCode}`);