# Convenções de Código

## Idioma

- Código de negócio (entidades, campos, rotas, labels): **pt-br**
- Código técnico (variáveis auxiliares, utilitários): **inglês aceito**
- Variáveis/funções: **camelCase**
- Classes/tipos: **PascalCase**

## Lint (Ultracite)

O linter enforça estilo de código (prefer `unknown`, `for...of`, `const`, `async/await`, etc.).

- Verificar: `bun lint`
- Corrigir: `bun lint:fix`

## Organização

- Early returns para reduzir aninhamento
- Funções focadas e com baixa complexidade
- Remova `console.log`, `debugger` e `alert` do código de produção
