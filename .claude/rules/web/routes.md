---
paths:
  - "apps/web/src/routes/**"
---

# Rotas (TanStack Router)

File-based routing com tipagem completa. O route tree é gerado automaticamente — **nunca edite `routeTree.gen.ts`**.

## Convenções de Arquivo

| Arquivo / Prefixo | Função |
|-------------------|--------|
| `__root.tsx` | Layout raiz (envolve toda a aplicação) |
| `_auth.tsx` | Layout pathless — protege rotas filhas sem adicionar segmento na URL |
| `_auth/dashboard.tsx` | Rota filha protegida: `/dashboard` |
| `index.tsx` | Rota exata do diretório (`/`) |
| `$param.tsx` | Segmento dinâmico (ex: `$postId.tsx` → `/posts/123`) |
| `$.tsx` | Catch-all (splat route) |

- Prefixo `_` = pathless layout (agrupa rotas sem afetar URL)
- Diretórios organizam hierarquia: `posts/` → `/posts/*`

## Regras

- **`createFileRoute`** para todas as rotas
- Passe **`from`** ao usar `useNavigate` (tipagem correta)
- Rotas protegidas ficam em `src/routes/_auth/`
- Autenticação via `beforeLoad` no layout `_auth.tsx`

## Ciclo de Vida da Rota

```
beforeLoad (pode entrar?) → loader (busca dados) → component (renderiza)
```

- `beforeLoad` falhou → loader **não executa**, redireciona
- `loader` garante dados no cache → componente renderiza **sem loading**

## Autenticação (beforeLoad)

O layout `_auth.tsx` protege todas as rotas filhas:

- `beforeLoad` verifica sessão via `ensureQueryData(sessionOptions)`
- Sem sessão → `throw redirect({ to: "/login" })`
- A sessão fica disponível no `context` para rotas filhas

## Loader — Pré-carregue Dados Antes do Render

O `loader` executa **antes** do componente renderizar. Isso elimina loading spinners na navegação — o usuário já vê os dados prontos.

- `loader` recebe `context.queryClient` via router context
- Use `ensureQueryData` para pré-carregar e cachear os dados
- Use o **mesmo `queryOptions()`** no loader e no componente (single source of truth)
- No componente, use `useSuspenseQuery` para ler do cache sem loading state

### Quando usar loader

| Tipo de query | Estratégia | Motivo |
|--------------|-----------|--------|
| `useQuery` (simples) | **`loader` com `ensureQueryData`** | Dados prontos antes do render |
| `useInfiniteQuery` (paginado) | Client-side, **sem loader** | Paginação é incremental, não faz sentido pré-carregar |

### Regras do loader

- **Sempre** `await` o `ensureQueryData` (evita inferência de tipo complexa no TS)
- Loader não retorna dados — apenas garante que estão no cache
- O componente lê do cache via `useSuspenseQuery` ou `useQuery`
