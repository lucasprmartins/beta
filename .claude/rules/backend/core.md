---
paths:
  - "packages/core/**/*.ts"
---

# Core Package

Lógica de negócio pura, sem dependências de frameworks ou banco de dados.

## Dois Padrões

### Padrão CRUD Simples (sem `domains/`)

Quando **não** existe lógica de negócio além de validação de formato.

#### Contratos

```typescript
import type { EntradaPaginacao, SaidaPaginacao } from "./paginacao";

export interface {Dominio}Data {
  id: number;
  nome: string;
}

export interface {Dominio}Repository {
  buscarPorId(id: number): Promise<{Dominio}Data | null>;
  listar(paginacao: EntradaPaginacao): Promise<SaidaPaginacao<{Dominio}Data>>;
  criar(data: Omit<{Dominio}Data, "id">): Promise<{Dominio}Data | null>;
  atualizar(id: number, data: Partial<Omit<{Dominio}Data, "id">>): Promise<{Dominio}Data | null>;
  deletar(id: number): Promise<boolean>;
}
```

- Use `Omit<>` e `Partial<>` em vez de DTOs separados
- Repositório com 5 métodos: buscar, listar, criar, atualizar, deletar

#### Application (passthrough)

```typescript
import type { {Dominio}Data, {Dominio}Repository } from "../contracts/{dominio}";

export function criar{Dominio}(repo: {Dominio}Repository) {
  return async (data: Omit<{Dominio}Data, "id">): Promise<{Dominio}Data | null> => {
    return await repo.criar(data);
  };
}

export function atualizar{Dominio}(repo: {Dominio}Repository) {
  return async (
    id: number,
    data: Partial<Omit<{Dominio}Data, "id">>
  ): Promise<{Dominio}Data | null> => {
    return await repo.atualizar(id, data);
  };
}

export function deletar{Dominio}(repo: {Dominio}Repository) {
  return async (id: number): Promise<boolean> => {
    return await repo.deletar(id);
  };
}
```

- Use cases delegam diretamente ao repositório
- Sem entidade, sem lógica de domínio

---

### Padrão Domínio Rico (com `domains/`)

Quando **existe** lógica de negócio: invariantes, regras, estados.

#### Contratos (DTOs separados)

```typescript
import type { EntradaPaginacao, SaidaPaginacao } from "./paginacao";

export interface Criar{Dominio}Input {
  nome: string;
}

export interface {Dominio}Data {
  id: number;
  nome: string;
  ativo: boolean;
}

export interface {Dominio}Repository {
  buscarPorId(id: number): Promise<{Dominio}Data | null>;
  listar(paginacao: EntradaPaginacao): Promise<SaidaPaginacao<{Dominio}Data>>;
  criar(data: {Dominio}Data): Promise<{Dominio}Data | null>;
  atualizar(id: number, data: {Dominio}Data): Promise<{Dominio}Data | null>;
}
```

- `Criar{Dominio}Input` — input de criação (sem `id`, sem campos gerados pela entidade)
- `{Dominio}Data` — dado completo persistido
- Repositório enxuto (4 métodos: buscar, listar, criar, atualizar) — sem `deletar`, `criarSeNaoExiste`, `buscarEAtualizar`

#### Domínios

```typescript
import type { Criar{Dominio}Input, {Dominio}Data } from "../contracts/{dominio}";

export class {Dominio} {
  readonly id: number;
  readonly nome: string;
  private _ativo: boolean;

  private constructor(data: {Dominio}Data) {
    this.id = data.id;
    this.nome = data.nome;
    this._ativo = data.ativo;
  }

  static criar(input: Criar{Dominio}Input): {Dominio} | null {
    if (!input.nome) return null;
    return new {Dominio}({
      id: 0,
      nome: input.nome,
      ativo: true,
    });
  }

  static restaurar(data: {Dominio}Data): {Dominio} {
    return new {Dominio}(data);
  }

  get ativo(): boolean {
    return this._ativo;
  }

  exportar(): {Dominio}Data {
    return {
      id: this.id,
      nome: this.nome,
      ativo: this._ativo,
    };
  }
}
```

- **Construtor privado** — nunca instanciado diretamente
- **`criar(input)`** — factory para novos objetos. Define defaults (id=0, etc.). Retorna `null` se inválido
- **`restaurar(data)`** — factory para reconstruir do banco. Não valida (dados já são válidos)
- **`exportar()`** — converte entidade para DTO
- Use `readonly` para campos imutáveis
- Use `private _campo` + getter para campos mutáveis com métodos de negócio

#### Application

```typescript
import type {
  Criar{Dominio}Input,
  {Dominio}Data,
  {Dominio}Repository,
} from "../contracts/{dominio}";
import { {Dominio} } from "../domains/{dominio}";

export function criar{Dominio}(repo: {Dominio}Repository) {
  return async (input: Criar{Dominio}Input): Promise<{Dominio}Data | null> => {
    const entidade = {Dominio}.criar(input);
    if (!entidade) return null;
    return await repo.criar(entidade.exportar());
  };
}

export function atualizar{Dominio}(repo: {Dominio}Repository) {
  return async (id: number, ...args): Promise<{Dominio}Data | null> => {
    const dados = await repo.buscarPorId(id);
    if (!dados) return null;

    const entidade = {Dominio}.restaurar(dados);
    // aplicar lógica de negócio na entidade
    return await repo.atualizar(id, entidade.exportar());
  };
}
```

- **Padrão claro:** buscar → `restaurar()` → aplicar lógica → `exportar()` → atualizar
- Criação usa `criar(input)` com `Criar{Dominio}Input`

---

## Ordem de Criação

### CRUD Simples
1. `packages/core/src/contracts/{dominio}.ts`
2. `packages/core/src/application/{dominio}.ts`

### Domínio Rico
1. `packages/core/src/contracts/{dominio}.ts`
2. `packages/core/src/domains/{dominio}.ts`
3. `packages/core/src/application/{dominio}.ts`

## Padrões

- Retorne `null` para: não encontrado, já existe, dados inválidos
- Reserve `throw` apenas para erros inesperados do sistema
