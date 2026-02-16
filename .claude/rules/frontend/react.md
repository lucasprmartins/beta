---
paths:
  - "apps/web/src/routes/**"
  - "apps/web/src/features/**"
  - "apps/web/src/components/**"
---

# Frontend (React 19 + TanStack)

## Estrutura

```
src/
├── routes/           # File-based routing (TanStack Router)
│   ├── __root.tsx    # Layout raiz
│   ├── _auth.tsx     # Layout autenticado
│   └── _auth/        # Rotas protegidas
├── features/         # Componentes de feature (um por domínio)
├── components/       # Componentes reutilizáveis
├── lib/              # Configurações (orpc, query client, auth)
└── utils/            # Utilitários
```

## Feature (`src/features/{dominio}.tsx`)

Estrutura de arquivo, de cima para baixo:

```typescript
import { /* ícones */ } from "@phosphor-icons/react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { client, orpc } from "../lib/orpc";

// 1. Tipos locais
interface FeedbackState {
  tipo: "success" | "error" | "info";
  mensagem: string;
}

// 2. Constantes e helpers
function exemploHelper() { /* ... */ }

// 3. Sub-componentes (composição)
function CardSkeleton() { /* ... */ }
function ListagemVazia() { /* ... */ }

// 4. Componente principal exportado
export function {Dominio}Dashboard() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  // Query: listar (paginado)
  const {
    data,
    isPending: carregando,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    orpc.{dominio}.listar.infiniteOptions({
      input: (cursor: number) => ({ cursor, limite: 10 }),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.proximoCursor,
    })
  );
  const itens = data?.pages.flatMap((page) => page.itens);

  // Mutation: criar
  const criarMutation = useMutation({
    mutationFn: (data: /* tipo */) => client.{dominio}.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.{dominio}.key() });
      setFeedback({ tipo: "success", mensagem: "{Dominio} criado!" });
    },
    onError: () => {
      setFeedback({ tipo: "error", mensagem: "Erro ao criar." });
    },
  });

  return ( /* JSX */ );
}
```

- Variáveis em pt-br: `carregando`, `erroListagem`, `itens`, `feedback`
- Sub-componentes no mesmo arquivo, acima do principal

## oRPC: `client` vs `orpc`

| Uso | Import | Exemplo |
|-----|--------|---------|
| **Queries** | `orpc` | `useQuery(orpc.{dominio}.listar.queryOptions())` |
| **Mutations** | `client` | `client.{dominio}.criar(data)` |
| **Invalidação** | `orpc` | `queryClient.invalidateQueries({ queryKey: orpc.{dominio}.key() })` |

## Rota (`src/routes/_auth/{dominio}.tsx`)

```typescript
import { createFileRoute } from "@tanstack/react-router";
import { {Dominio}Dashboard } from "@/features/{dominio}";

export const Route = createFileRoute("/_auth/{dominio}")({
  component: {Dominio}Dashboard,
});
```

- Rotas protegidas em `src/routes/_auth/`
- Infinite queries carregam client-side, sem `loader` com `ensureQueryData`
- Use `loader` com `ensureQueryData` apenas para queries simples (`useQuery`)
- **NÃO criar** `routeTree.gen.ts` (gerado automaticamente)

## TanStack Router

- Use `createFileRoute` para rotas
- Sempre passe `from` ao usar `useNavigate`
- Use `beforeLoad` para autenticação
- Use `loader` para carregar dados antes de renderizar

## TanStack Query

- Prefira `isPending` sobre `isLoading`
- Configure `staleTime` > 0 para evitar refetch
- Invalide queries relacionadas após mutations

## React 19

- **Não use `FormEvent`** (deprecated). Use `React.SyntheticEvent`
- Prefira `useTransition` para atualizações não-urgentes
- Evite `useEffect` para sincronização de dados (use Query)

## Autenticação

```typescript
const session = await context.queryClient.ensureQueryData(sessionOptions);
if (!session) throw redirect({ to: "/login" });
```
