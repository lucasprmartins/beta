---
paths:
  - "packages/infra/**/*.ts"
---

# Infra

Implementações concretas: banco de dados e integrações externas.

## Schema (`src/db/schema/`)

- **Sempre** `.enableRLS()` em toda tabela
- **Sempre** incluir `createdAt` e `updatedAt` (timestamps com timezone)
- Nome da tabela: singular minúsculo
- **Nunca use `real` para monetários** — use `numeric("col", { precision: 10, scale: 2 })`
  - Retorna `string`: converter com `Number()` na leitura e `String()` na escrita

## Repositórios (`src/db/repositories/`)

- Helper `exportar()` converte linha DB → DTO (exclui `createdAt`/`updatedAt`)
- `.returning()` em insert/update/delete
- `.limit(1)` em consultas de item único, destructure com `const [row]`
- `.set()`/`.values()` **nunca** incluem `id`, `createdAt`, `updatedAt`
- Paginação: busca `limite + 1` com offset, `slice(0, limite)`, retorna `proximoCursor: temMais ? cursor + limite : null`

## Transações

- Use `db.transaction(async (tx) => {...})` para atomicidade
- Use `tx` (não `db`) para todas as queries dentro da transação
- Rollback automático se exceção for lançada

## Migrations

- **Nunca** edite `src/db/migrations/` manualmente
- Após criar ou alterar schema: `bun db:generate`

## Seed (`src/db/seed.ts`)

- `reset(db, schema)` limpa tabelas com TRUNCATE CASCADE
- `seed(db, schema).refine()` customiza geradores por coluna
- Importar schema e adicionar ao objeto `schema`

## Integrações (`src/integrations/`)

- Storage S3: `gerarUrlUpload()`, `gerarUrlDownload()`, `removerObjeto()`, `listarObjetos()`
- Imagens: guardar a **key** no banco; na API, gerar presigned URL com `gerarUrlDownload(key, 900)`
- Upload: gerar key no backend (`"prefixo/${crypto.randomUUID()}"`), retornar com `gerarUrlUpload(key, contentType, 900)`
- n8n: classe `N8n` com `path()` para webhooks tipados
- Cada integração em arquivo separado

