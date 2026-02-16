# Convenções Gerais

## Nomenclatura

- Nomes de domínio: **pt-br**
- Variáveis/funções: **camelCase**
- Classes/tipos: **PascalCase**

## Tratamento de Erros

- **Nunca use `throw Error` para fluxos esperados**
- Retorne `null`: não encontrado, já existe, dados inválidos
- Reserve `throw` apenas para erros inesperados do sistema

## Boas Práticas (Ultracite)

Execute `bun lint` para verificar e `bun lint:fix` para corrigir.

### TypeScript

- Prefira `unknown` sobre `any`
- Use `as const` para valores imutáveis
- Use narrowing em vez de type assertions

### JavaScript Moderno

- Arrow functions para callbacks
- `for...of` sobre `.forEach()` e `for` indexado
- Optional chaining (`?.`) e nullish coalescing (`??`)
- `const` por padrão, `let` quando necessário, nunca `var`

### Async

- Sempre use `await` em funções async
- Prefira `async/await` sobre promise chains

### Organização

- Mantenha funções focadas e com baixa complexidade
- Early returns para reduzir aninhamento
- Remova `console.log`, `debugger` e `alert` do código de produção
- No backend, use o `logger` de `@app/infra/logger` (Pino) em vez de `console.log`:
  - `logger.info()` para operações normais
  - `logger.error({ err }, "mensagem")` para erros
  - `logger.debug()` para informações de desenvolvimento
