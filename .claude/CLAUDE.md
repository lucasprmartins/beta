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
├── infra/         # Infraestrutura (DB + Integrações externas)
├── auth/          # Autenticação (Better Auth)
└── api/           # Definição da API (oRPC)
```

## Camadas do Backend

```
Server (Elysia)
├── Auth → Sessão/Cookies
└── API (oRPC + Middleware)
    └── Application (Use Cases)
        └── Domain (Regras de negócio)
            └── Repository (Core → Infra)
```

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

## Comandos

| Comando | Descrição |
|---------|-----------|
| `bun lint` | Verifica lint (Ultracite) |
| `bun lint:fix` | Corrige lint |
| `bun check-types` | Verifica tipagem TypeScript |
| `bun db:generate` | Gera migration Drizzle |

## Regras

Convenções detalhadas em `.claude/rules/`:
- **Backend**: `core.md`, `infra.md`, `api.md`, `auth.md`, `server.md`, `env.md`
- **Frontend**: `react.md`, `styling.md`, `tanstack-query.md`
- **Geral**: `general.md`, `git.md`, `domain-checklist.md`, `context7.md`
