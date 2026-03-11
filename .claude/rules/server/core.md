---
paths:
  - "packages/core/**"
---

## Lógica de Negócio

A lógica de negócio é o coração do sistema, onde as regras e invariantes do domínio são implementadas. Ela deve ser completamente isolada de detalhes técnicos (banco de dados, APIs, etc) para garantir que as regras de negócio sejam claras, testáveis e independentes de frameworks.

### Instruções

- Regras de negócio ficam em `packages/core/src/domains/`, cada domínio é um módulo com suas entidades, regras e casos de uso.
- Use Cases ficam em `packages/core/src/application/`, recebem repositórios por injeção (higher-order function) e implementam a orquestração da lógica de negócio, chamando as entidades e repositórios conforme necessário.
- Contratos de interfaces de repositório + DTOs ficam em `packages/core/src/contracts/`, que a infraestrutura implementa.
- **CRUD** não tem camada application — o router chama o repositório.
- Retorne `null` para fluxos esperados (não encontrado, já existe, inválido...)
- Entidades são classes que representam os objetos do domínio com suas regras e invariantes. Elas encapsulam o estado e comportamento relacionados a um conceito do negócio, garantindo que as regras sejam sempre respeitadas.
- As entidades são apenas para **DOMÍNIO DE NEGÓCIOS**.
- Use `readonly` para campos imutáveis.
- Use `private _campo` + getter para campos mutáveis.
