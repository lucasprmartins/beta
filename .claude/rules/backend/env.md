---
paths:
  - "packages/infra/src/env.ts"
  - "**/.env*"
---

# Variáveis de Ambiente

Todas as variáveis de ambiente do servidor são validadas no startup via Zod em `packages/infra/src/env.ts`.

## Regras

- **Nunca** use `process.env` diretamente no código — importe `env` de `@app/infra/env`
- A única exceção é `packages/infra/drizzle.config.ts` (roda fora do servidor)
- Ao adicionar uma nova variável de ambiente:
  1. Adicione ao schema Zod em `packages/infra/src/env.ts`
  2. Adicione ao `apps/server/.env.example`
  3. Use `env.NOME_DA_VARIAVEL` no código
- Variáveis obrigatórias: use `z.string().min(1)`
- Variáveis opcionais: use `z.string().optional().default("valor")`
- **Nunca** use `as string` para forçar tipo de variável de ambiente