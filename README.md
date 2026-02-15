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
- **API** -- Routers oRPC com middlewares de acesso: `requireAuth` e `requireRole("admin", ...)`.
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
bun env
```

3. Preencha as variáveis no `apps/server/.env`:

```
DATABASE_URL=postgresql://usuario:senha@localhost:5432/db
CORS_ORIGIN=http://localhost:3001
BETTER_AUTH_URL=http://localhost:3000
```

> O `BETTER_AUTH_SECRET` é gerado automaticamente pelo script `bun env`.

4. Aplique o schema no banco de dados:

```bash
bun db:migrate
```

5. Inicie o ambiente de desenvolvimento:

```bash
bun dev
```

O servidor roda em `http://localhost:3000` e o frontend em `http://localhost:3001`.

## Deploy

O template usa [Railway](https://railway.com) para infraestrutura. O script de deploy automatiza a criação do projeto e provisionamento dos serviços (PostgreSQL, etc.).

### Pré-requisitos

- [Railway CLI](https://docs.railway.com/guides/cli) instalado e autenticado (`railway login`)

### Primeiro deploy

```bash
bun railway:deploy
```

O script vai pedir:

1. **Nome do projeto** — nome que aparecerá no dashboard do Railway
2. **Nome do workspace** — workspace onde o projeto será criado
3. **Código do template** — template de infra a ser aplicado (Enter para usar o padrão)

Após execução, o dashboard do Railway abrirá automaticamente. Aguarde o deploy finalizar e então configure o ambiente local:

```bash
bun env
```

### Desenvolvimento

Para trabalhar em novas features ou correções, crie uma branch e abra uma Pull Request. O Railway cria automaticamente um ambiente isolado para cada PR com banco de dados e serviços próprios, permitindo testar sem afetar produção.

Para popular o ambiente da PR com dados de teste:

```bash
bun railway:seed
```

O script vai pedir o nome do ambiente (ex: `meu-projeto-pr-4`) e executar o seed contra o banco da PR.

> O arquivo de seed está em `packages/infra/src/db/seed.ts`. Adicione suas tabelas e customize os dados gerados conforme necessário.

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
| `bun db:seed` | Popula o banco com dados falsos |
| `bun db:studio` | Abre o Drizzle Studio |
| `bun lint` | Verifica linting |
| `bun lint:fix` | Corrige linting |
| `bun check-types` | Verifica tipos TypeScript |
| `bun env` | Configura variáveis de ambiente |
| `bun cleanup` | Remove arquivos de exemplo |
| `bun railway:deploy` | Cria projeto e provisiona infra no Railway |
| `bun railway:seed` | Executa seed em ambiente de PR no Railway |
