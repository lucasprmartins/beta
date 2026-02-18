---
paths:
  - "apps/server/**/*.ts"
  - "packages/core/**/*.ts"
  - "packages/infra/**/*.ts"
  - "packages/api/**/*.ts"
  - "packages/auth/**/*.ts"
---

# Regras Transversais (Backend)

Regras que se aplicam a todo código server-side.

## Logger (Pino)

Use `logger` de `@app/infra/logger` — **nunca** `console.log` no backend.

- `logger.info()` para operações normais
- `logger.error({ err }, "mensagem")` para erros
- `logger.debug()` para desenvolvimento

## Variáveis de Ambiente

- **Nunca** use `process.env` — importe `env` de `@app/infra/env`
- Exceção: `drizzle.config.ts` (roda fora do servidor)
- Nova variável: adicionar ao schema Zod em `packages/infra/src/env.ts` + `apps/server/.env.example`
- Obrigatórias: `z.string().min(1)` / Opcionais: `z.string().optional().default("valor")`
- **Nunca** `as string` para forçar tipo
