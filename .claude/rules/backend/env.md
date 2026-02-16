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

## Variáveis

### Obrigatórias

| Variável | Validação | Descrição |
|----------|-----------|-----------|
| `DATABASE_URL` | `z.string().min(1)` | URL de conexão PostgreSQL |
| `BETTER_AUTH_URL` | `z.url()` | URL base do servidor para o Better Auth |
| `BETTER_AUTH_SECRET` | `z.string().min(1)` | Secret para assinatura de tokens |
| `CORS_ORIGIN` | `z.string().optional().default("")` | Origens permitidas (separar por vírgula: `http://localhost:3001,https://app.exemplo.com`) |
| `LOG_LEVEL` | `z.enum([...]).optional().default("info")` | Nível de log: `debug`, `info`, `warn`, `error`, `fatal` |

### Storage S3 (opcionais)

| Variável | Default | Descrição |
|----------|---------|-----------|
| `S3_ENDPOINT` | — | URL do endpoint S3-compatível |
| `S3_REGION` | `"auto"` | Região do bucket |
| `S3_ACCESS_KEY_ID` | — | Access key |
| `S3_SECRET_ACCESS_KEY` | — | Secret key |
| `S3_BUCKET` | — | Nome do bucket |
