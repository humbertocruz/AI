import Parser from './parser/parser.ts';
import Transpiler from './transpiler/transpiler.ts';
import * as fs from 'node:fs';
import { join, resolve } from 'node:path';
import * as tf from '@tensorflow/tfjs-node';

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.error("Uso: aiscript run <caminho_para_o_arquivo>");
        return;
    }

    const command = args[0];

    if (command !== 'run') {
        console.error(`Comando desconhecido '${command}'. Tente 'run'`);
        return;
    }

    const filePath = resolve(args[1]);

    if (!fs.existsSync(filePath)) {
        console.error(`Erro: O arquivo não foi encontrado em '${filePath}'`);
        return;
    }

    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    const parser = new Parser();
    const ast = parser.produceAST(sourceCode);

    const transpiler = new Transpiler();
    const tsCode = transpiler.transpile(ast);

    // Injeta a função print no escopo global
    const print = (...args: any[]) => console.log(...args);

    eval(tsCode);
}

main();