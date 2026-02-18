---
paths:
  - "packages/api/**/*.ts"
---

# API (oRPC)

Routers oRPC com validação Zod e erros tipados.

## Auth Middleware (`src/auth.ts`)

| Uso | Como |
|-----|------|
| Rota pública | `o.route(...)` |
| Requer sessão | `o.use(requireAuth).route(...)` |
| Requer role | `o.use(requireRole("admin")).route(...)` |

## Regras de Router

- Instanciar use cases no **nível do módulo**: `const criar = criarDominio(dominioRepository)`
- Schemas Zod com `.describe()` em cada campo (gera documentação OpenAPI)
- `.route()` com `method`, `path`, `summary`, `description`, `tags`
- `z.coerce.number()` para inputs de GET (query params chegam como string)
- Convenção: `{dominio}Router`, registrar em `src/index.ts`

## Tratamento de Erros

- Use `.errors()` com dados tipados — nunca `ORPCError` direto
- Converta `null` do Core em erros HTTP: `NOT_FOUND`, `CONFLICT`, `BAD_REQUEST`
- Handler verifica `null` e lança `throw errors.X({ data: {...} })`

## Pre-fetch (Domínio Rico)

Em operações sobre recurso existente, busque antes de delegar ao use case:

- Primeiro `null` → `NOT_FOUND` (recurso não existe)
- Segundo `null` → `BAD_REQUEST` (operação inválida no recurso existente)

## Handlers (`src/index.ts`)

- `RPCHandler` — endpoint `/rpc` para o frontend (binary protocol)
- `OpenAPIHandler` — endpoint `/api` com docs automáticas (apenas em dev)
- `onError` — interceptor que loga erros via Pino
