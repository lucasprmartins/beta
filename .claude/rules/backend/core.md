---
paths:
  - "packages/core/**/*.ts"
---

# Core Package

Lógica de negócio pura, sem dependências de frameworks ou banco de dados.

## Contratos (`src/contracts/`)

Interfaces e tipos compartilhados (DTOs e contratos de repositório).

```typescript
import type { EntradaPaginacao, SaidaPaginacao } from "./paginacao";

export interface {Dominio}Data {
  id: string;
  nome: string;
}

export interface {Dominio}Repository {
  buscarPorId(id: string): Promise<{Dominio}Data | null>;
  buscarTodos(): Promise<{Dominio}Data[]>;
  listar(paginacao: EntradaPaginacao): Promise<SaidaPaginacao<{Dominio}Data>>;
  criar(data: {Dominio}Data): Promise<{Dominio}Data | null>;
  atualizar(id: string, data: {Dominio}Data): Promise<{Dominio}Data | null>;
  deletar(id: string): Promise<boolean>;
  criarSeNaoExiste(data: {Dominio}Data): Promise<{Dominio}Data | null>;
  buscarEAtualizar(
    id: string,
    transformar: (dados: {Dominio}Data) => {Dominio}Data | null,
  ): Promise<{Dominio}Data | null>;
}
```

- Tipo do ID depende do domínio (`string` para UUIDs, `number` para sequenciais)
- Adicionar métodos de consulta extras conforme necessário (`buscarPorNome`, etc.)
- Incluir apenas métodos que o domínio realmente precisa
- `buscarTodos()` para uso interno; `listar()` para API com paginação (usa tipos de `./paginacao`)

## Domínios (`src/domains/`)

Entidades com regras de negócio:

```typescript
import type { {Dominio}Data } from "../contracts/{dominio}";

export class {Dominio} {
  readonly id: string;
  readonly nome: string;

  private constructor(data: {Dominio}Data) {
    this.id = data.id;
    this.nome = data.nome;
  }

  static criar(data: {Dominio}Data): {Dominio} | null {
    if (!data.nome) {
      return null;
    }
    return new {Dominio}(data);
  }

  paraDados(): {Dominio}Data {
    return {
      id: this.id,
      nome: this.nome,
    };
  }
}
```

- **Construtor privado** + factory estático público `criar()`
- `criar()` retorna `null` quando validação falha
- `paraDados()` converte entidade para DTO
- Use `readonly` para campos imutáveis
- Use `private _campo` + getter para campos mutáveis com métodos de negócio
- Arrays: use spread no construtor e em `paraDados()`: `this.items = [...data.items]`

## Aplicação (`src/application/`)

Use cases com injeção de dependência via closure:

```typescript
import type { {Dominio}Data, {Dominio}Repository } from "../contracts/{dominio}";
import { {Dominio} } from "../domains/{dominio}";

export function criar{Dominio}(repo: {Dominio}Repository) {
  return async (data: {Dominio}Data): Promise<{Dominio}Data | null> => {
    const entidade = {Dominio}.criar(data);
    if (!entidade) return null;
    return repo.criarSeNaoExiste(entidade.paraDados());
  };
}

export function atualizar{Dominio}(repo: {Dominio}Repository) {
  return async (id: string, data: {Dominio}Data): Promise<{Dominio}Data | null> => {
    const existente = await repo.buscarPorId(id);
    if (!existente) return null;
    const entidade = {Dominio}.criar(data);
    if (!entidade) return null;
    return repo.atualizar(id, entidade.paraDados());
  };
}

export function deletar{Dominio}(repo: {Dominio}Repository) {
  return async (id: string): Promise<boolean> => {
    return repo.deletar(id);
  };
}
```

- Cada use case: função que recebe repositório → retorna função assíncrona
- Retornar `null` para falhas esperadas (não encontrado, já existe, inválido)
- Adicionar verificações de unicidade quando necessário (`buscarPorNome` antes de criar)
- Use cases customizados: buscar → criar entidade → aplicar método → persistir

## Ordem de Criação

1. `packages/core/src/contracts/{dominio}.ts`
2. `packages/core/src/domains/{dominio}.ts`
3. `packages/core/src/application/{dominio}.ts`

## Padrões

- Retorne `null` para: não encontrado, já existe, dados inválidos
- Reserve `throw` apenas para erros inesperados do sistema
