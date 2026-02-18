# Projeto

Monorepo template com arquitetura limpa orientada a domínios de negócio.

## Estrutura

```
apps/
├── server/        # Orquestrador HTTP (Elysia)
└── web/           # Interface (React 19 + TanStack)

packages/
├── core/          # Lógica de negócio pura (sem deps externas)
├── infra/         # Banco de dados + integrações
├── api/           # Routers oRPC
├── auth/          # Autenticação (Better Auth)
└── config/        # Configurações compartilhadas (tsconfig)
```

## Stack

| Camada | Tecnologia |
|--------|------------|
| Runtime | Bun |
| Server | Elysia |
| API | oRPC |
| Auth | Better Auth |
| DB | Drizzle ORM + PostgreSQL |
| Frontend | React 19 + TanStack Router/Query |
| Styling | Tailwind CSS + DaisyUI |
| Icons | Phosphor Icons |
| Storage | AWS SDK S3 (R2/MinIO) |

## Dependências entre Pacotes

| Pacote | Importa de |
|--------|------------|
| `core` | Nenhum — é puro |
| `infra` | `core` (implementa contratos) |
| `api` | `core` (use cases), `infra` (repositórios) |
| `auth` | `infra` (DB para sessões) |
| `server` | `api`, `auth`, `infra` |
| `web` | `auth` (client), API via oRPC client |

## Domínios

Dois padrões: **CRUD Simples** (sem lógica de negócio) e **Domínio Rico** (com entidades, invariantes e regras). Detalhes nas rules de cada camada.

## Comandos

| Comando | Descrição |
|---------|-----------|
| `bun dev` | Inicia server + web |
| `bun lint` | Verifica lint (Ultracite) |
| `bun lint:fix` | Corrige lint |
| `bun check-types` | Verifica tipagem TypeScript |
| `bun db:generate` | Gera migration Drizzle |

## Regras

Convenções detalhadas em `.claude/rules/`:

- **Config**: `conventions.md`, `git.md`, `context7.md`
- **Server**: `server.md`, `core.md`, `infra.md`, `api.md`, `auth.md`
- **Web**: `components.md`, `queries.md`, `routes.md`, `styling.md`
