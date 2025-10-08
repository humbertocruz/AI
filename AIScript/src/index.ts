import Parser from './parser/parser';
import Transpiler from './transpiler/transpiler';
import * as fs from 'fs';
import * as path from 'path';

function main() {
    const args = process.argv.slice(2);
    if (args.length !== 1) {
        console.error("Uso: aiscript <caminho_para_o_arquivo>");
        return;
    }

    const filePath = path.resolve(args[0]);

    if (!fs.existsSync(filePath)) {
        console.error(`Erro: O arquivo não foi encontrado em '${filePath}'`);
        return;
    }

    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    const parser = new Parser();
    const ast = parser.produceAST(sourceCode);

    const transpiler = new Transpiler();
    const tsCode = transpiler.transpile(ast);

    // Executa o código transpilado
    eval(tsCode);
}

main();