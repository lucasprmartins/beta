---
paths:
  - "packages/core/**/*.ts"
---

# Core

Lógica de negócio pura — sem dependências de frameworks, banco ou HTTP.

## Contratos (`src/contracts/`)

Interfaces de repositório + DTOs que a Infra implementa.

### CRUD Simples

- `{Dominio}Data` — interface completa
- `{Dominio}Repository` — 5 métodos: `buscarPorId`, `listar`, `criar`, `atualizar`, `deletar`
- Use `Omit<Data, "id">` para criar e `Partial<Omit<Data, "id">>` para atualizar

### Domínio Rico

- `Criar{Dominio}Input` — input de criação (sem `id`, sem campos gerados pela entidade)
- `{Dominio}Data` — dado completo persistido
- `{Dominio}Repository` — 5 métodos: `buscarPorId`, `listar`, `criar`, `atualizar`, `deletar`
- DTOs separados porque a entidade gera campos com defaults (ex: `ativo: true`)

## Entidades (`src/domains/`)

Apenas para Domínio Rico. A entidade é a **guardiã das regras de negócio** — toda mutação passa por ela.

- **Construtor privado** — nunca instanciado diretamente
- **`criar(input)`** — factory para novos objetos, define defaults (`id: 0`, `ativo: true`), retorna `null` se inválido
- **`restaurar(data)`** — reconstrói do banco, não valida (dados já são válidos)
- **`exportar()`** — converte entidade para DTO
- `readonly` para campos imutáveis, `private _campo` + getter para mutáveis
- Estado encapsulado: não se seta campo diretamente, se chama um método (ex: `desativar()`, não `ativo = false`)

### Retornos de métodos de negócio

- `boolean` — valida + muta, retorna `false` se invariante seria violada (ex: `removerEstoque(qtd)` com estoque insuficiente)
- `void` — mutação sem validação, sempre sucede (ex: `desativar()`)
- Computed getters — derivados de múltiplos campos (ex: `get disponivel()` = ativo + estoque > 0)

## Application (`src/application/`)

Use cases recebem repositório por injeção (higher-order function).

- **CRUD Simples**: passthrough — delega diretamente ao repositório
- **Domínio Rico**: toda operação passa pela entidade
  - Criar: `Entidade.criar(input)` → `exportar()` → `repo.criar()`
  - Atualizar: `repo.buscar()` → `Entidade.restaurar()` → método de negócio → `exportar()` → `repo.atualizar()`
  - Deletar: `repo.deletar()`

## Regras

- Retorne `null` para fluxos esperados (não encontrado, já existe, inválido)
- Reserve `throw` apenas para erros inesperados do sistema
