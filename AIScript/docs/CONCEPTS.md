# Conceitos e Funcionalidades da AIScript

Este documento descreve as ideias e conceitos fundamentais para o desenvolvimento da AIScript, uma linguagem de programação baseada em TypeScript e otimizada para ser gerada e utilizada por modelos de Inteligência Artificial.

## 1. Princípios de Design

- **Foco na IA, não no Humano:** A sintaxe e a estrutura da linguagem devem priorizar a facilidade de geração e interpretação por modelos de IA, em vez da legibilidade humana.
- **Sintaxe Mínima e Densa:** Reduzir o "boilerplate" e a verbosidade ao mínimo essencial. Usar símbolos e palavras-chave curtas.
- **Tipagem Forte e Estendida:** Manter a base do TypeScript, mas com tipos nativos para conceitos de IA, como `Tensor`, `Model`, `Dataset`, e `Pipeline`.
- **Ecossistema Baseado em Transpilação:** O código AIScript será transpilado para TypeScript/JavaScript otimizado, permitindo a execução em ambientes como Node.js e navegadores, e aproveitando o ecossistema NPM.

## 2. Funcionalidades Propostas

### a. Sintaxe de Variáveis e Funções

Uma sintaxe mais compacta para declarações.

**Exemplo:**
```typescript
// TypeScript tradicional
let myVar: string = "hello";
function add(a: number, b: number): number {
    return a + b;
}

// Proposta para AIScript
let myVar: str = "hello";
fn add(a: num, b: num) -> num {
    ret a + b;
}
```

### b. Operadores Nativos para Tensores

Operadores infixed para operações matemáticas em tensores, que seriam transpilados para chamadas de bibliotecas como TensorFlow.js.

**Exemplo:**
```aiscript
// Carrega dois tensores (sintaxe a definir)
let tensorA = load_tensor('...');
let tensorB = load_tensor('...');

// Soma de tensores de forma nativa
let resultTensor = tensorA + tensorB; // Transpila para tf.add(tensorA, tensorB)

// Multiplicação de matrizes
let matrixMul = tensorA @ tensorB; // Transpila para tf.matMul(tensorA, tensorB)
```

### c. Pipelines de Dados Declarativos

Uma sintaxe para definir pipelines de processamento de dados de forma clara e encadeada.

**Exemplo:**
```aiscript
// Define um pipeline de dados
pipeline dataProcessing {
    load_csv('data.csv')
    |> normalize('column_name')
    |> shuffle()
    |> batch(32)
}

// Usa o pipeline
let dataset = run(dataProcessing);
```

### d. Carregamento e Inferência de Modelos

Uma forma ultra-simplificada de carregar um modelo e executar a inferência.

**Exemplo:**
```aiscript
// Carrega um modelo ONNX e executa a predição
model myModel = load('path/to/model.onnx');
let input = load_image('image.jpg');
let output = myModel.predict(input);
```

## 3. Próximos Passos

- [ ] Refinar e detalhar a sintaxe de cada funcionalidade.
- [ ] Definir o conjunto completo de tipos de dados nativos para IA.
- [ ] Esboçar a arquitetura do parser e do transpiler.
- [ ] Criar exemplos de código mais complexos em AIScript.