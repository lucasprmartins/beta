---
paths:
  - "packages/infra/**/*.ts"
---

# Infra Package

Implementações concretas de banco de dados e integrações externas.

## Estrutura

```
src/
├── db/
│   ├── index.ts            # Conexão com o banco
│   ├── schema/             # Definição das tabelas (Drizzle)
│   ├── repositories/       # Implementação dos contratos
│   └── migrations/         # Migrations geradas
├── integrations/
│   └── index.ts            # Serviços externos (Stripe, etc.)
├── storage/
│   └── client.ts           # Storage S3-compatível (R2/MinIO)
├── env.ts                  # Variáveis de ambiente
└── logger.ts               # Logger (Pino)
```

## Schema (`src/db/schema/`)

```typescript
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const {dominio} = pgTable("{dominio}", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}).enableRLS();
```

- Importar tipos de `drizzle-orm/pg-core`: `serial`, `text`, `integer`, `boolean`, `timestamp`, `numeric`, `jsonb`
- **Nunca use `real` para valores monetários** — use `numeric("coluna", { precision: 10, scale: 2 })` (retorna `string`; converter com `Number()` na leitura via `exportar()` e com `String()` na escrita via `.values()`/`.set()`)
- **Sempre** adicionar `.enableRLS()`
- **Sempre** incluir `createdAt` e `updatedAt`
- `.unique()` para campos únicos
- `.notNull()` para obrigatórios
- `.default()` para valores padrão
- `.array()` para arrays: `text("tipos").array().notNull()`
- Nome da tabela: singular minúsculo

## Repositories (`src/db/repositories/`)

```typescript
import type {
  {Dominio}Data,
  {Dominio}Repository,
} from "@app/core/contracts/{dominio}";
import { eq } from "drizzle-orm";
import { db } from "../index";
import { {dominio} } from "../schema/{dominio}";

function exportar(row: typeof {dominio}.$inferSelect): {Dominio}Data {
  return {
    id: row.id,
    nome: row.nome,
  };
}

export const db{Dominio}Repository: {Dominio}Repository = {
  async buscarPorId(id) {
    const [row] = await db
      .select()
      .from({dominio})
      .where(eq({dominio}.id, id))
      .limit(1);
    return row ? exportar(row) : null;
  },

  async listar({ cursor, limite }) {
    const rows = await db
      .select()
      .from({dominio})
      .limit(limite + 1)
      .offset(cursor);

    const temMais = rows.length > limite;
    const itens = (temMais ? rows.slice(0, limite) : rows).map(exportar);

    return {
      itens,
      proximoCursor: temMais ? cursor + limite : null,
    };
  },

  async criar(data) {
    const [row] = await db
      .insert({dominio})
      .values({
        nome: data.nome,
      })
      .returning();
    return row ? exportar(row) : null;
  },

  async atualizar(id, data) {
    const [row] = await db
      .update({dominio})
      .set({
        nome: data.nome,
      })
      .where(eq({dominio}.id, id))
      .returning();
    return row ? exportar(row) : null;
  },

  async deletar(id) {
    const result = await db
      .delete({dominio})
      .where(eq({dominio}.id, id))
      .returning();
    return result.length > 0;
  },
};
```

- Helper `exportar()` converte linha DB → DTO (exclui `createdAt`/`updatedAt`)
- Convenção: `db{Dominio}Repository`
- Importar `eq` de `drizzle-orm` para where
- `const [row]` para consultas de linha única
- `.returning()` em insert/update/delete
- `.limit(1)` em consultas de item único
- `listar()`: busca `limite + 1` com offset, `slice(0, limite)` para itens, `proximoCursor = temMais ? cursor + limite : null`
- `.set()` **não** inclui `id`, `createdAt`, `updatedAt`
- `.values()` **não** inclui `id`, `createdAt`, `updatedAt` (gerados auto)
- CRUD Simples inclui `deletar`; Domínio Rico geralmente não precisa

## Transações (opcional)

Use `db.transaction()` quando precisar de atomicidade (leitura + escrita ou múltiplas escritas):

```typescript
async criarComVerificacao(data) {
  return db.transaction(async (tx) => {
    const [existente] = await tx
      .select()
      .from({dominio})
      .where(eq({dominio}.nome, data.nome))
      .limit(1);

    if (existente) return null;

    const [row] = await tx
      .insert({dominio})
      .values({ ... })
      .returning();

    return row ? exportar(row) : null;
  });
},
```

- Use `tx` (não `db`) para todas as queries dentro da transação
- Rollback é automático se uma exceção for lançada
- Use para: verificar existência + criar, operações multi-tabela

## Ordem de Criação

1. `packages/infra/src/db/schema/{dominio}.ts`
2. `packages/infra/src/db/repositories/{dominio}.ts`

Após criar, executar `bun db:generate` para migration.

**Regras de migration:**
- **Nunca** edite arquivos em `src/db/migrations/` manualmente — são gerados pelo Drizzle Kit
- Após criar ou alterar schema, execute `bun db:generate` para gerar a migration
- Use `bun db:push` apenas em desenvolvimento local para aplicar schema direto
- Use `bun db:migrate` em produção para aplicar migrations versionadas

## Integrações

- Implemente contratos definidos em `@app/core/contracts`
- Cada integração em arquivo separado

## Referências

- **`env.ts`** — Variáveis de ambiente. Documentação detalhada em `.claude/rules/backend/env.md`
- **`logger.ts`** — Logger Pino. Uso documentado em `.claude/rules/general.md`
- **`storage/client.ts`** — Storage S3-compatível (R2/MinIO). Funções exportadas: `gerarUrlUpload(key, contentType, expiresIn?)`, `gerarUrlDownload(key, expiresIn?)`, `removerObjeto(key)`, `listarObjetos(prefix?)`
