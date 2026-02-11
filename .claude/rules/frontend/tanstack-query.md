---
paths:
  - "apps/web/**/*.{ts,tsx}"
---

# TanStack Query + oRPC

## Exports: `client` vs `orpc`

| Export | Uso | Quando usar |
|--------|-----|-------------|
| `client` | Chamadas diretas | `mutationFn`, chamadas imperativas |
| `orpc` | Utilitários Query | `queryOptions()`, `key()`, `infiniteOptions()` |

## Queries

### useQuery

```typescript
import { useQuery } from "@tanstack/react-query";
import { orpc } from "../lib/orpc";

const {
  data: itens,
  isPending: carregando,
  error: erroListagem,
} = useQuery(orpc.{dominio}.listar.queryOptions());
```

### Com input

```typescript
const { data } = useQuery(
  orpc.{dominio}.buscar.queryOptions({
    input: { id: 123 },
  })
);
```

### Prefetch no loader (TanStack Router)

```typescript
export const Route = createFileRoute("/_auth/{dominio}")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(orpc.{dominio}.listar.queryOptions()),
  component: {Dominio}Dashboard,
});
```

## Mutations

### useMutation

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client, orpc } from "../lib/orpc";

const queryClient = useQueryClient();

const criarMutation = useMutation({
  mutationFn: (data: CriarInput) => client.{dominio}.criar(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: orpc.{dominio}.key() });
  },
  onError: (error) => {
    console.error("Erro ao criar:", error);
  },
});

// Uso
criarMutation.mutate({ nome: "Exemplo" });
```

### Estados da mutation

```typescript
const { mutate, isPending, isError, isSuccess, error } = criarMutation;

// isPending: true enquanto executa
// isError: true se falhou
// isSuccess: true se concluiu
```

### Callbacks por chamada

```typescript
criarMutation.mutate(dados, {
  onSuccess: (resultado) => {
    // Callback específico desta chamada
  },
  onError: (erro) => {
    // Tratamento específico
  },
});
```

## Invalidação de Cache

### Invalidar domínio completo

```typescript
queryClient.invalidateQueries({ queryKey: orpc.{dominio}.key() });
```

### Invalidar query específica

```typescript
queryClient.invalidateQueries({
  queryKey: orpc.{dominio}.buscar.key({ input: { id: 123 } }),
});
```

### Invalidar múltiplos domínios

```typescript
await Promise.all([
  queryClient.invalidateQueries({ queryKey: orpc.usuarios.key() }),
  queryClient.invalidateQueries({ queryKey: orpc.pedidos.key() }),
]);
```

## Infinite Queries (Paginação)

```typescript
import { useInfiniteQuery } from "@tanstack/react-query";

const {
  data,
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

// Renderização
{data?.pages.flatMap((page) => page.itens).map((item) => (
  <Card key={item.id} item={item} />
))}

// Botão carregar mais
<button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
  {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
</button>
```

## Padrões do Projeto

### Nomenclatura (pt-br)

```typescript
const {
  data: itens,           // não "items" ou "data"
  isPending: carregando, // não "loading" ou "isLoading"
  error: erroListagem,   // não "error" diretamente
} = useQuery(...);
```

### Estrutura de mutation com feedback

```typescript
const [feedback, setFeedback] = useState<{
  tipo: "success" | "error" | "info";
  mensagem: string;
} | null>(null);

const criarMutation = useMutation({
  mutationFn: (data) => client.{dominio}.criar(data),
  onSuccess: (resultado) => {
    queryClient.invalidateQueries({ queryKey: orpc.{dominio}.key() });
    setFeedback({ tipo: "success", mensagem: "Criado com sucesso!" });
  },
  onError: () => {
    setFeedback({ tipo: "error", mensagem: "Erro ao criar." });
  },
});
```

### Loading state em botões

```typescript
<button
  onClick={() => criarMutation.mutate(dados)}
  disabled={criarMutation.isPending}
>
  {criarMutation.isPending ? (
    <span className="loading loading-spinner loading-sm" />
  ) : (
    "Salvar"
  )}
</button>
```

## Boas Práticas

- **Prefira `isPending`** sobre `isLoading` (TanStack Query v5)
- **Invalide após mutations** para manter dados sincronizados
- **Use `ensureQueryData`** no loader para SSR/prefetch
- **Mesmo `queryOptions()`** no loader e no componente
- **Mutations usam `client`**, queries usam `orpc`
