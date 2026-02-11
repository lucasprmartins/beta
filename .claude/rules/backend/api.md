---
paths:
  - "packages/api/**/*.ts"
---

# API Package

Definição de rotas usando oRPC.

## Auth Middleware (`src/auth.ts`)

Três níveis de acesso:

- **`publicRouter`** - Sem autenticação
- **`authRouter`** - Requer sessão (retorna `UNAUTHORIZED`)
- **`adminRouter`** - Requer role `admin` (retorna `FORBIDDEN`)

## Routers (`src/routers/`)

```typescript
import { criar{Dominio} } from "@app/core/application/{dominio}";
import { db{Dominio}Repository } from "@app/infra/db/repositories/{dominio}";
import { z } from "zod";
import { publicRouter } from "../auth";

const criar = criar{Dominio}(db{Dominio}Repository);

const {dominio}Schema = z.object({
  id: z.string().describe("ID"),
  nome: z.string().min(1).describe("Nome"),
});

export const {dominio}Router = {
  buscar: publicRouter
    .route({
      method: "GET",
      path: "/{dominio}/buscar",
      summary: "Buscar {Dominio}",
      description: "Busca um(a) {dominio} pelo ID.",
      tags: ["{Dominio}"],
    })
    .input(z.object({ id: z.string().min(1).describe("ID") }))
    .output({dominio}Schema)
    .errors({
      NOT_FOUND: {
        message: "{Dominio} não encontrado(a)",
        data: z.object({ id: z.string() }),
      },
    })
    .handler(async ({ input, errors }) => {
      const result = await db{Dominio}Repository.buscarPorId(input.id);
      if (!result) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }
      return result;
    }),

  criar: publicRouter
    .route({
      method: "POST",
      path: "/{dominio}/criar",
      summary: "Criar {Dominio}",
      description: "Cria um(a) novo(a) {dominio}.",
      tags: ["{Dominio}"],
    })
    .input({dominio}Schema)
    .output({dominio}Schema)
    .errors({
      CONFLICT: {
        message: "{Dominio} já existe",
        data: z.object({ nome: z.string() }),
      },
    })
    .handler(async ({ input, errors }) => {
      const result = await criar(input);
      if (!result) {
        throw errors.CONFLICT({ data: { nome: input.nome } });
      }
      return result;
    }),

  listar: publicRouter
    .route({
      method: "GET",
      path: "/{dominio}/listar",
      summary: "Listar {Dominio}s",
      description: "Lista todos(as) os(as) {dominio}s.",
      tags: ["{Dominio}"],
    })
    .output(z.array({dominio}Schema))
    .handler(async () => db{Dominio}Repository.buscarTodos()),
};
```

- Importar nível de auth conforme requisitos: `publicRouter`, `authRouter` ou `adminRouter`
- **Instanciar use cases no nível do módulo**: `const criar = criar{Dominio}(db{Dominio}Repository)`
- Schema Zod com `.describe()` em cada campo para documentação OpenAPI
- `.route()` com `method`, `path`, `summary`, `description`, `tags`
- `.errors()` com dados tipados para respostas de erro
- Handler verifica `null` e lança erros tipados
- GET-por-ID: usar `z.string()` (não number), transformar se necessário
- Convenção: `{dominio}Router`

## Registrar Router (`src/index.ts`)

```typescript
import { {dominio}Router } from "./routers/{dominio}";

export const router = {
  // ...existentes
  {dominio}: {dominio}Router,
};
```

O tipo `AppRouterClient` atualiza automaticamente (deriva de `typeof router`).

## Ordem de Criação

6. `packages/api/src/routers/{dominio}.ts`
7. Registrar em `packages/api/src/index.ts`

## Padrões

- Valide input com schemas Zod
- Converta `null` para erros HTTP apropriados (404, 409)
- Use `.errors()` com dados tipados em vez de `ORPCError` direto
