---
---

# Checklist: Novo Domínio

Ao criar um novo domínio, siga esta ordem exata. Cada passo referencia a regra detalhada do pacote correspondente.

## Backend

1. `packages/core/src/contracts/{dominio}.ts` — Interface `{Dominio}Data` + `{Dominio}Repository`
2. `packages/core/src/domains/{dominio}.ts` — Entidade com `criar()` + `paraDados()`
3. `packages/core/src/application/{dominio}.ts` — Use cases (`criar{Dominio}`, etc.)
4. `packages/infra/src/db/schema/{dominio}.ts` — Tabela Drizzle com `.enableRLS()`
5. `packages/infra/src/db/repositories/{dominio}.ts` — `db{Dominio}Repository` implementando o contrato
6. `packages/api/src/routers/{dominio}.ts` — Router oRPC com schemas Zod
7. `packages/api/src/index.ts` — Registrar `{dominio}: {dominio}Router`

## Após backend

8. Executar `bun db:generate` para gerar migration

## Frontend

9. `apps/web/src/features/{dominio}.tsx` — Componente dashboard com Query/Mutation
10. `apps/web/src/routes/_auth/{dominio}.tsx` — Rota protegida com loader
11. `apps/web/src/components/sidebar.tsx` — Adicionar item ao menu

## Validação

12. `bun check-types` — Verificar tipagem
13. `bun lint` — Verificar lint
