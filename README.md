# Beta Template

Template full-stack TypeScript com arquitetura limpa em monorepo.

## Stack

- **Runtime**: Bun
- **Monorepo**: Turborepo
- **Server**: Elysia
- **Frontend**: React 19, Vite, Tailwind CSS, DaisyUI
- **Roteamento**: TanStack Router (file-based)
- **Estado do servidor**: TanStack Query
- **API**: oRPC (type-safe RPC + REST/OpenAPI)
- **Banco de dados**: PostgreSQL, Drizzle ORM
- **Autenticação**: Better Auth
- **Validação**: Zod
- **Storage**: AWS SDK S3 (compatível com S3, Cloudflare R2, MinIO)
- **Linting**: Biome (Ultracite)

## Estrutura

```
apps/
  server/          Servidor HTTP (Elysia + Bun)
  web/             Frontend (React 19 + TanStack)

packages/
  config/          Configurações compartilhadas (tsconfig)
  core/            Lógica de negócio (sem dependências externas)
  infra/           Infraestrutura (banco de dados + integrações)
  auth/            Autenticação (Better Auth)
  api/             Definição da API (oRPC)
```

### Camadas do Backend

```
Server (Elysia)
  -> API (oRPC Router + Middleware de Auth)
    -> Application (Use Cases)
      -> Domain (Entidades com regras de negócio)
        -> Repository (Contrato no Core, implementação na Infra)
```

- **Core** -- Contratos (interfaces/DTOs), domínios (entidades) e use cases. Sem dependências externas.
- **Infra** -- Schemas Drizzle, repositórios, storage (S3) e integrações com serviços externos.
- **API** -- Routers oRPC com três níveis de acesso: `publicRouter`, `authRouter` e `adminRouter`.
- **Auth** -- Configuração do Better Auth (server e client).

### Frontend

- Roteamento file-based com TanStack Router (`src/routes/`)
- Rotas protegidas via layout `_auth.tsx` com redirect automático
- Integração type-safe com backend via oRPC + TanStack Query
- Estilização com Tailwind CSS + DaisyUI
- Ícones com Phosphor Icons

## Requisitos

- [Bun](https://bun.sh) >= 1.3.9
- PostgreSQL

## Setup

1. Instale as dependências:

```bash
bun install
```

2. Configure as variáveis de ambiente copiando os arquivos de exemplo:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
```

3. Preencha as variáveis no `apps/server/.env`:

```
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco
CORS_ORIGIN=http://localhost:3001
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=sua_chave_secreta

# Storage (opcional)
S3_ENDPOINT=
S3_REGION=auto
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=
```

4. Aplique o schema no banco de dados:

```bash
bun db:push
```

5. Inicie o ambiente de desenvolvimento:

```bash
bun dev
```

O servidor roda em `http://localhost:3000` e o frontend em `http://localhost:3001`.

## Scripts

| Comando | Descrição |
|---|---|
| `bun dev` | Inicia todos os apps em modo desenvolvimento |
| `bun dev:server` | Inicia apenas o servidor |
| `bun dev:web` | Inicia apenas o frontend |
| `bun build` | Build de produção |
| `bun db:push` | Aplica schema no banco |
| `bun db:generate` | Gera migrations |
| `bun db:migrate` | Executa migrations |
| `bun db:studio` | Abre o Drizzle Studio |
| `bun lint` | Verifica linting |
| `bun lint:fix` | Corrige linting |
| `bun check-types` | Verifica tipos TypeScript |

## Criando um novo domínio

O projeto inclui arquivos `example.ts` em cada camada como template. Para criar um novo domínio, siga a ordem:

1. **Contrato** -- `packages/core/src/contracts/` (interface do DTO e repositório)
2. **Domínio** -- `packages/core/src/domains/` (entidade com regras de negócio)
3. **Use Cases** -- `packages/core/src/application/` (casos de uso)
4. **Schema** -- `packages/infra/src/db/schema/` (tabela Drizzle)
5. **Repositório** -- `packages/infra/src/db/repositories/` (implementação)
6. **Router** -- `packages/api/src/routers/` (rotas oRPC)
7. **Frontend** -- `apps/web/src/routes/` e `apps/web/src/features/` (páginas e componentes)
