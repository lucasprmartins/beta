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
│   ├── index.ts          # Conexão com o banco
│   ├── schema/           # Definição das tabelas (Drizzle)
│   ├── repositories/     # Implementação dos contratos
│   └── drizzle/          # Migrations geradas
└── integrations/         # Serviços externos (Stripe, etc.)
```

## Schema (`src/db/schema/`)

```typescript
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const {dominio} = pgTable("{dominio}", {
  id: text("id").primaryKey(),
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

- Importar tipos de `drizzle-orm/pg-core`: `text`, `integer`, `boolean`, `timestamp`, `real`, `jsonb`
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

function paraDados(row: typeof {dominio}.$inferSelect): {Dominio}Data {
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
    return row ? paraDados(row) : null;
  },

  async buscarTodos() {
    const rows = await db.select().from({dominio});
    return rows.map(paraDados);
  },

  async criar(data) {
    const [row] = await db
      .insert({dominio})
      .values({
        id: data.id,
        nome: data.nome,
      })
      .returning();
    return row ? paraDados(row) : null;
  },

  async atualizar(id, data) {
    const [row] = await db
      .update({dominio})
      .set({
        nome: data.nome,
      })
      .where(eq({dominio}.id, id))
      .returning();
    return row ? paraDados(row) : null;
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

- Helper `paraDados()` converte linha DB → DTO (exclui `createdAt`/`updatedAt`)
- Convenção: `db{Dominio}Repository`
- Importar `eq` de `drizzle-orm` para where
- `const [row]` para consultas de linha única
- `.returning()` em insert/update/delete
- `.limit(1)` em consultas de item único
- `.set()` **não** inclui `id`, `createdAt`, `updatedAt`
- `.values()` **não** inclui `createdAt`, `updatedAt` (gerados auto)

## Ordem de Criação

4. `packages/infra/src/db/schema/{dominio}.ts`
5. `packages/infra/src/db/repositories/{dominio}.ts`

Após criar, executar `bun db:generate` para migration.

**Regras de migration:**
- **Nunca** edite arquivos em `src/db/migrations/` manualmente — são gerados pelo Drizzle Kit
- Após criar ou alterar schema, execute `bun db:generate` para gerar a migration
- Use `bun db:push` apenas em desenvolvimento local para aplicar schema direto
- Use `bun db:migrate` em produção para aplicar migrations versionadas

## Integrações

- Implemente contratos definidos em `@app/core/contracts`
- Cada integração em arquivo separado
