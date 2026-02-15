# Arquitetura do Projeto

Monorepo com arquitetura limpa, separando responsabilidades em pacotes independentes.

## Estrutura

```
apps/
├── server/        # Servidor HTTP (Elysia/Bun)
└── web/           # Frontend (React 19 + TanStack)

packages/
├── config/        # Configurações compartilhadas (tsconfig)
├── core/          # Lógica de negócio (sem dependências externas)
├── infra/         # Infraestrutura (DB + Storage + APIs externas)
├── auth/          # Autenticação (Better Auth)
└── api/           # Definição da API (oRPC)
```

## Fluxo de Dados

```
Server → Auth → Sessão/Cookies
       → API (oRPC + Middleware) → Application → Domain → Repository (Contrato)
                                                                ↓
                                                        Infra (Implementação)
```

## Princípios

- **Retorne `null`, não `throw`** para fluxos esperados (não encontrado, já existe, inválido)
- **Injeção de dependência** via closure nos use cases
- **Dois padrões de domínio**: CRUD Simples e Domínio Rico (ver regras em `.claude/rules/`)
- **CRUD Simples** — sem `domains/`, use cases passthrough, `Omit<>`/`Partial<>` para tipos
- **Domínio Rico** — com `domains/`, DTOs separados (`CriarInput` + `Data`), entidade com `criar()` + `restaurar()` + `exportar()`
- **Factory methods**: `criar()` para novos objetos, `restaurar()` para reconstruir do banco
- **`exportar()`** converte entidade para DTO
- **Nomes em pt-br** para domínio de negócio

## Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime/PM | Bun |
| Server | Elysia |
| API | oRPC |
| Auth | Better Auth |
| DB | Drizzle ORM + PostgreSQL |
| Frontend | React 19 + TanStack Router/Query |
| Styling | Tailwind CSS + DaisyUI |
| Icons | Phosphor Icons |
| Storage | AWS SDK S3 (compatível com R2/MinIO) |

## Decisões Técnicas

| Tecnologia | Por quê |
|------------|---------|
| **Bun** | Performance superior ao Node, package manager nativo, compatível com TypeScript sem build |
| **Elysia** | Framework otimizado para Bun, tipagem end-to-end, plugins extensíveis |
| **oRPC** | Type-safety completa entre server e client, gera OpenAPI automaticamente, integra com TanStack Query |
| **Better Auth** | Solução completa de auth sem vendor lock-in, suporte nativo a Drizzle, extensível via plugins |
| **Drizzle ORM** | Type-safe, SQL-first, migrations versionadas, suporte a RLS e PostgreSQL features |
| **TanStack Router** | File-based routing, type-safe, code splitting automático, integração nativa com Query |
| **TanStack Query** | Cache inteligente, deduplicação, prefetch, integração com oRPC via `queryOptions()` |
| **DaisyUI** | Componentes semânticos sobre Tailwind, temas built-in, sem JavaScript extra |
| **Phosphor Icons** | Biblioteca consistente, múltiplos pesos (regular, bold, fill), tree-shakeable |
| **AWS SDK S3** | Compatível com qualquer storage S3 (AWS, Cloudflare R2, MinIO), presigned URLs para upload direto do browser |

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `bun lint` | Verifica erros de lint (Ultracite) |
| `bun lint:fix` | Corrige erros de lint automaticamente |
| `bun check-types` | Verifica erros de tipagem TypeScript |

## Regras

- Respeite as boas práticas de desenvolvimento
- Consulte Context7 (MCP) para documentação de frameworks
- Não crie comentários no código a não ser que eu peça
- Não use comando de build a não ser que eu peça
- Não tente gerar rotas do TanStack Router (ele gera automaticamente)
- Não use `cd` para o diretório de trabalho — você já está nele. Use `cd` apenas quando realmente precisar mudar de diretório
