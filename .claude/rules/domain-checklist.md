---
---

# Checklist: Novo Domínio

Ao criar um novo domínio, primeiro decida o padrão: **CRUD Simples** ou **Domínio Rico**.

> **Critério de decisão:** Existe lógica de negócio além de validação de formato? Se sim, use Domínio Rico. Se não, use CRUD Simples.

---

## CRUD Simples (sem `domains/`)

### Backend

1. `packages/core/src/contracts/{dominio}.ts` — Interface `{Dominio}Data` + `{Dominio}Repository` com `Omit<>`/`Partial<>` para criar/atualizar
2. `packages/core/src/application/{dominio}.ts` — Use cases passthrough (delegam ao repo)
3. `packages/infra/src/db/schema/{dominio}.ts` — Tabela Drizzle com `.enableRLS()`
4. `packages/infra/src/db/repositories/{dominio}.ts` — `{dominio}Repository` implementando o contrato (5 métodos: buscar, listar, criar, atualizar, deletar)
5. `packages/api/src/routers/{dominio}.ts` — Router oRPC com schemas Zod
6. `packages/api/src/index.ts` — Registrar `{dominio}: {dominio}Router`

### Após backend

7. Executar `bun db:generate` para gerar migration

### Frontend

8. `apps/web/src/features/{dominio}.tsx` — Componente dashboard com `useInfiniteQuery` + Mutation
9. `apps/web/src/routes/_auth/{dominio}.tsx` — Rota protegida (sem loader para listagens paginadas)
10. `apps/web/src/components/sidebar.tsx` — Adicionar item ao menu

### Validação

11. `bun check-types` — Verificar tipagem
12. `bun lint` — Verificar lint

---

## Domínio Rico (com `domains/`)

### Backend

1. `packages/core/src/contracts/{dominio}.ts` — DTOs separados: `Criar{Dominio}Input` + `{Dominio}Data` + `{Dominio}Repository`
2. `packages/core/src/domains/{dominio}.ts` — Entidade com `criar()` + `restaurar()` + `exportar()` + métodos de negócio
3. `packages/core/src/application/{dominio}.ts` — Use cases: buscar → `restaurar()` → lógica → `exportar()` → atualizar
4. `packages/infra/src/db/schema/{dominio}.ts` — Tabela Drizzle com `.enableRLS()`
5. `packages/infra/src/db/repositories/{dominio}.ts` — `{dominio}Repository` enxuto (4 métodos: buscar, listar, criar, atualizar)
6. `packages/api/src/routers/{dominio}.ts` — Router oRPC com schemas Zod
7. `packages/api/src/index.ts` — Registrar `{dominio}: {dominio}Router`

### Após backend

8. Executar `bun db:generate` para gerar migration

### Frontend

9. `apps/web/src/features/{dominio}.tsx` — Componente dashboard com `useInfiniteQuery` + Mutation
10. `apps/web/src/routes/_auth/{dominio}.tsx` — Rota protegida (sem loader para listagens paginadas)
11. `apps/web/src/components/sidebar.tsx` — Adicionar item ao menu

### Validação

12. `bun check-types` — Verificar tipagem
13. `bun lint` — Verificar lint
