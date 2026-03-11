---
paths:
  - "packages/infra/**"
---

## Infraestrutura (Drizzle e integrações)

A infraestrutura é responsável por implementar detalhes técnicos como acesso a banco de dados, serviços externos e frameworks. Deve ser o mais isolada possível do domínio para facilitar manutenção e testes.

## Instruções

### Banco de Dados (Drizzle ORM)

- Os nomes das tabelas são singular em lower_snake_case.
- **SEMPRE** incluir `.enableRLS()` nas tabelas.
- **SEMPRE** incluir `createdAt` e `updatedAt` (timestamps com timezone) como colunas nas tabelas.
- `.returning()` em querys com INSERT/UPDATE/DELETE para obter os dados afetados.
- `.limit(1)` em consultas de item único, destructure com `const [row]`.
- `.set()`/`.values()` **NUNCA** incluem `id`, `createdAt`, `updatedAt`.
- Paginação: busca `limite + 1` com offset, `slice(0, limite)`, retorna `nextCursor: more ? cursor + limite : null`
- **NUNCA** edite `src/db/migrations/`.
- Após criar ou alterar schema utilize o comando `bun db:generate`.

#### Transactions

- Use `db.transaction(async (tx) => {...})` para atomicidade.
- Use `tx` (não `db`) para todas as queries dentro da transação.
- Rollback automático se exceção for lançada.

### Integrações

- As integrações com serviços externos (APIs, filas, etc) são separados em módulos dentro de `packages/infra/integrations/`.
