---
paths:
  - "packages/api/**/*.ts"
---

# API Package

Definição de rotas usando oRPC.

## Auth Middleware (`src/auth.ts`)

Middlewares composáveis para controle de acesso:

- **`o`** - Base sem autenticação (rotas públicas)
- **`requireAuth`** - Middleware que requer sessão (retorna `UNAUTHORIZED`)
- **`requireRole(...roles)`** - Middleware que requer role específica (retorna `UNAUTHORIZED` ou `FORBIDDEN`)

### Tabela de migração

| Uso | Exemplo |
|-----|---------|
| Rota pública | `o.route(...)` |
| Requer autenticação | `o.use(requireAuth).route(...)` |
| Requer role admin | `o.use(requireRole("admin")).route(...)` |
| Requer múltiplas roles | `o.use(requireRole("admin", "editor")).route(...)` |

## Routers (`src/routers/`)

```typescript
import { criar{Dominio} } from "@app/core/application/{dominio}";
import { {dominio}Repository } from "@app/infra/db/repositories/{dominio}";
import { z } from "zod";
import { o } from "../auth";

const criar = criar{Dominio}({dominio}Repository);

const {dominio}Schema = z.object({
  id: z.string().describe("ID"),
  nome: z.string().min(1).describe("Nome"),
});

export const {dominio}Router = {
  buscar: o
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
      const result = await {dominio}Repository.buscarPorId(input.id);
      if (!result) {
        throw errors.NOT_FOUND({ data: { id: input.id } });
      }
      return result;
    }),

  criar: o
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

  listar: o
    .route({
      method: "GET",
      path: "/{dominio}/listar",
      summary: "Listar {Dominio}s",
      description: "Lista {dominio}s com paginação.",
      tags: ["{Dominio}"],
    })
    .input(
      z.object({
        cursor: z.coerce.number().int().min(0).default(0).describe("Offset para paginação"),
        limite: z.coerce.number().int().min(1).max(100).default(10).describe("Itens por página"),
      })
    )
    .output(
      z.object({
        itens: z.array({dominio}Schema),
        proximoCursor: z.number().nullable(),
      })
    )
    .handler(async ({ input }) => {dominio}Repository.listar(input)),
};
```

- Importar middlewares conforme necessidade: `import { o, requireAuth, requireRole } from "../auth"`
- **Instanciar use cases no nível do módulo**: `const criar = criar{Dominio}({dominio}Repository)`
- Schema Zod com `.describe()` em cada campo para documentação OpenAPI
- `.route()` com `method`, `path`, `summary`, `description`, `tags`
- `.errors()` com dados tipados para respostas de erro
- Handler verifica `null` e lança erros tipados
- GET-por-ID: usar `z.string()` (não number), transformar se necessário
- `z.coerce.number()` no input de GET: query params chegam como strings
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

## Erros Tipados Avançados

### Múltiplos erros no mesmo endpoint

```typescript
.errors({
  NOT_FOUND: {
    message: "{Dominio} não encontrado(a)",
    data: z.object({ id: z.string() }),
  },
  CONFLICT: {
    message: "{Dominio} já existe com este nome",
    data: z.object({ nome: z.string() }),
  },
  BAD_REQUEST: {
    message: "Dados inválidos",
    data: z.object({ campos: z.array(z.string()) }),
  },
})
.handler(async ({ input, errors }) => {
  const existente = await repo.buscarPorNome(input.nome);
  if (existente) {
    throw errors.CONFLICT({ data: { nome: input.nome } });
  }

  const entidade = {Dominio}.criar(input);
  if (!entidade) {
    throw errors.BAD_REQUEST({ data: { campos: ["nome"] } });
  }

  const result = await repo.criar(entidade.exportar());
  if (!result) {
    throw errors.NOT_FOUND({ data: { id: input.id } });
  }

  return result;
})
```

### Erros com contexto do usuário autenticado

```typescript
atualizar: o
  .use(requireAuth)
  .route({ ... })
  .errors({
    FORBIDDEN: {
      message: "Você não pode editar este recurso",
      data: z.object({ userId: z.string(), recursoId: z.string() }),
    },
  })
  .handler(async ({ input, context, errors }) => {
    const recurso = await repo.buscarPorId(input.id);
    if (recurso?.donoId !== context.session.user.id) {
      throw errors.FORBIDDEN({
        data: { userId: context.session.user.id, recursoId: input.id },
      });
    }
    // ...
  })
```

## Padrões

- Valide input com schemas Zod
- Converta `null` para erros HTTP apropriados (404, 409)
- Use `.errors()` com dados tipados em vez de `ORPCError` direto

## Setup dos Handlers (`src/index.ts`)

```typescript
import { logger } from "@app/infra/logger";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";

export const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error) =>
      logger.error({ err: error, handler: "rpc" }, "erro no handler")
    ),
  ],
});

export const apiHandler = new OpenAPIHandler(router, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) =>
      logger.error({ err: error, handler: "api" }, "erro no handler")
    ),
  ],
});
```

- **`RPCHandler`** — endpoint `/rpc` para o frontend (binary protocol, mais eficiente)
- **`OpenAPIHandler`** — endpoint `/api` com documentação OpenAPI automática
- **`onError`** — interceptor que loga erros via Pino antes de retornar ao client
- `AppRouterClient` é derivado automaticamente de `typeof router`

## Padrão Pre-fetch (Domínio Rico)

Em handlers de domínio rico, busque o recurso antes de delegar ao use case para diferenciar `NOT_FOUND` de `BAD_REQUEST`:

```typescript
.handler(async ({ input, errors }) => {
  const dados = await produtoRepository.buscarPorId(input.id);
  if (!dados) {
    throw errors.NOT_FOUND({ data: { id: input.id } });
  }

  const resultado = await removerEstoque(input.id, input.quantidade);
  if (!resultado) {
    throw errors.BAD_REQUEST({ data: { id: input.id } });
  }

  return resultado;
})
```

- Primeiro `null` → `NOT_FOUND` (recurso não existe)
- Segundo `null` → `BAD_REQUEST` (operação inválida no recurso existente)
