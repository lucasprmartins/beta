---
paths:
  - "apps/web/src/lib/orpc.ts"
  - "apps/web/src/features/**"
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

## Estratégias de Atualização

### Quando usar cada padrão

| Interação | Estratégia | Motivo |
|---|---|---|
| CRUD com formulário | Invalidação | Fluxo natural já tem delay (preencher → salvar) |
| Listagem paginada (infinite query) | Invalidação | Manipular estrutura de `pages` é complexo demais |
| Toggle / favoritar / curtir | Optimistic | Ação instantânea, feedback imediato importa |
| Drag & drop / reordenar | Optimistic | Usuário precisa ver o resultado na hora |
| Deletar item de lista simples | Optimistic | Remoção visual imediata melhora a percepção |

### Optimistic update (atualização)

```typescript
const queryClient = useQueryClient();

const atualizarMutation = useMutation({
  mutationFn: (dados: AtualizarInput) => client.{dominio}.atualizar(dados),
  onMutate: async (novosDados) => {
    await queryClient.cancelQueries({ queryKey: orpc.{dominio}.listar.key() });
    const anterior = queryClient.getQueryData(orpc.{dominio}.listar.key());
    queryClient.setQueryData(orpc.{dominio}.listar.key(), (old) =>
      old?.map((item) => (item.id === novosDados.id ? { ...item, ...novosDados } : item))
    );
    return { anterior };
  },
  onError: (_err, _vars, contexto) => {
    queryClient.setQueryData(orpc.{dominio}.listar.key(), contexto?.anterior);
    setFeedback({ tipo: "error", mensagem: "Erro ao atualizar." });
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: orpc.{dominio}.key() });
  },
});
```

### Optimistic update (deleção)

```typescript
const deletarMutation = useMutation({
  mutationFn: (id: string) => client.{dominio}.deletar({ id }),
  onMutate: async (id) => {
    await queryClient.cancelQueries({ queryKey: orpc.{dominio}.listar.key() });
    const anterior = queryClient.getQueryData(orpc.{dominio}.listar.key());
    queryClient.setQueryData(orpc.{dominio}.listar.key(), (old) =>
      old?.filter((item) => item.id !== id)
    );
    return { anterior };
  },
  onError: (_err, _vars, contexto) => {
    queryClient.setQueryData(orpc.{dominio}.listar.key(), contexto?.anterior);
    setFeedback({ tipo: "error", mensagem: "Erro ao deletar." });
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: orpc.{dominio}.key() });
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

// Loading inicial
if (carregando) return <ListagemSkeleton />;

// Renderização
{itens?.map((item) => (
  <Card key={item.id} item={item} />
))}

// Botão carregar mais
<button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
  {isFetchingNextPage ? "Carregando..." : "Carregar mais"}
</button>
```

### Invalidação após mutation

```typescript
const criarMutation = useMutation({
  mutationFn: (data) => client.{dominio}.criar(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: orpc.{dominio}.key() });
  },
});
```

Invalidar com `.key()` do domínio reseta todas as páginas do infinite query.

### Nomenclatura pt-br para infinite queries

```typescript
const {
  data,                              // contém pages
  isPending: carregando,             // loading inicial
  fetchNextPage: carregarMais,       // função para próxima página
  hasNextPage: temMaisPaginas,       // boolean
  isFetchingNextPage: carregandoMais, // loading de próxima página
} = useInfiniteQuery(...);
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
- **Invalidação** como padrão para mutations; **optimistic updates** apenas para interações instantâneas (toggles, deleções)
- **Use `ensureQueryData`** no loader para SSR/prefetch
- **Mesmo `queryOptions()`** no loader e no componente
- **Mutations usam `client`**, queries usam `orpc`

## Tratamento de Erros da API

### Erros tipados no onError

```typescript
import { ORPCError } from "@orpc/client";

const criarMutation = useMutation({
  mutationFn: (data) => client.{dominio}.criar(data),
  onError: (error) => {
    if (error instanceof ORPCError) {
      if (error.code === "CONFLICT") {
        setFeedback({ tipo: "error", mensagem: "Já existe um registro com este nome." });
        return;
      }
      if (error.code === "UNAUTHORIZED") {
        setFeedback({ tipo: "error", mensagem: "Sessão expirada. Faça login novamente." });
        return;
      }
    }
    setFeedback({ tipo: "error", mensagem: "Erro inesperado. Tente novamente." });
  },
});
```

### Códigos de erro comuns

| Código | Significado | Ação sugerida |
|--------|-------------|---------------|
| `NOT_FOUND` | Recurso não encontrado | Feedback + invalidar cache |
| `CONFLICT` | Recurso já existe | Feedback informativo |
| `UNAUTHORIZED` | Sessão expirada | Redirecionar para login |
| `FORBIDDEN` | Sem permissão | Feedback informativo |
| `BAD_REQUEST` | Input inválido | Mostrar erros de validação |
