---
paths:
  - "apps/web/src/lib/orpc.ts"
  - "apps/web/src/features/**"
---

# Queries (TanStack Query v5 + oRPC)

## client vs orpc

| Export | Uso |
|--------|-----|
| `orpc` | Queries: `queryOptions()`, `infiniteOptions()`, `key()` |
| `client` | Mutations: `mutationFn`, chamadas imperativas |

## Regras

- `isPending` sobre `isLoading` (TanStack Query v5)
- Invalidação como padrão após mutations
- Mesmo `queryOptions()` no loader e no componente
- `ensureQueryData` no loader para queries simples
- Invalidar com `.key()` do domínio reseta todas as páginas do infinite query
- Nomenclatura pt-br: `carregando`, `itens`, `erroListagem`, `carregandoMais`

## Estratégias de Atualização

| Interação | Estratégia | Motivo |
|-----------|-----------|--------|
| CRUD com formulário | Invalidação | Fluxo natural já tem delay |
| Listagem paginada | Invalidação | Manipular `pages` é complexo |
| Toggle / favoritar / curtir | Optimistic | Feedback imediato importa |
| Drag & drop / reordenar | Optimistic | Resultado visual na hora |
| Deletar item de lista | Optimistic | Remoção visual imediata |

**Ações com feedback instantâneo DEVEM usar optimistic updates.** O usuário não pode esperar o servidor responder para ver o resultado.

### Padrão Optimistic

```
onMutate(variables, context):
  1. context.client.cancelQueries(key)      → evita refetch sobrescrever
  2. snapshot = context.client.getQueryData  → salva estado anterior
  3. context.client.setQueryData(...)        → atualiza cache otimisticamente
  4. return { snapshot }

onError(err, variables, onMutateResult, context):
  → context.client.setQueryData(key, onMutateResult.snapshot)  → rollback

onSettled(data, error, variables, onMutateResult, context):
  → context.client.invalidateQueries(key)  → resync com servidor
```

## Feedback em Mutations

- Estado local `useState<{ tipo: "success" | "error" | "info"; mensagem: string } | null>`
- `onSuccess`: invalidar cache + feedback positivo
- `onError`: feedback de erro

## Erros da API

Usar `ORPCError` de `@orpc/client` para tratar erros tipados no `onError`.

| Código | Ação sugerida |
|--------|---------------|
| `NOT_FOUND` | Feedback + invalidar cache |
| `CONFLICT` | Feedback informativo |
| `UNAUTHORIZED` | Redirecionar para login |
| `FORBIDDEN` | Feedback informativo |
| `BAD_REQUEST` | Mostrar erros de validação |
