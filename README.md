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

O projeto inclui dois padrões de exemplo em cada camada (`example-crud` e `example-domain`). Escolha o padrão adequado, duplique, renomeie e apague os exemplos.

> **Critério de decisão:** Existe lógica de negócio além de validação de formato? Se sim, use **Domínio Rico**. Se não, use **CRUD Simples**.

### CRUD Simples

Quando o domínio é apenas dados sem regras de negócio. Sem arquivo em `domains/`.

| Camada | Arquivo |
|--------|---------|
| Contrato | `packages/core/src/contracts/` — `{Dominio}Data` + `{Dominio}Repository` com `Omit<>`/`Partial<>` |
| Use Cases | `packages/core/src/application/` — passthrough (delegam ao repo) |
| Schema | `packages/infra/src/db/schema/` — tabela Drizzle |
| Repositório | `packages/infra/src/db/repositories/` — 5 métodos (buscar, listar, criar, atualizar, deletar) |
| Router | `packages/api/src/routers/` — rotas oRPC |
| Frontend | `apps/web/src/routes/` e `apps/web/src/features/` |

### Domínio Rico

Quando existem invariantes, regras de negócio, estados. Com arquivo em `domains/`.

| Camada | Arquivo |
|--------|---------|
| Contrato | `packages/core/src/contracts/` — DTOs separados: `Criar{Dominio}Input` + `{Dominio}Data` |
| Domínio | `packages/core/src/domains/` — entidade com `criar()` + `restaurar()` + `exportar()` |
| Use Cases | `packages/core/src/application/` — buscar → restaurar → lógica → exportar → atualizar |
| Schema | `packages/infra/src/db/schema/` — tabela Drizzle |
| Repositório | `packages/infra/src/db/repositories/` — 4 métodos (buscar, listar, criar, atualizar) |
| Router | `packages/api/src/routers/` — rotas oRPC |
| Frontend | `apps/web/src/routes/` e `apps/web/src/features/` |

### Comparativo

| | CRUD Simples | Domínio Rico |
|--|--|--|
| `contracts/` | `{Dominio}Data` + utility types | DTOs separados (`CriarInput` + `Data`) |
| `domains/` | Não existe | `criar()`, `restaurar()`, `exportar()`, métodos de negócio |
| `application/` | Passthrough | Buscar → restaurar → lógica → exportar → atualizar |
| Validação | Zod no router | Entidade (invariantes) + Zod (formato) |

### Removendo os exemplos

Após entender os padrões, remova todos os arquivos de exemplo e comece seu projeto:

```bash
bash scripts/cleanup-examples.sh
```

O script apaga os arquivos `example-crud` e `example-domain` de todas as camadas, limpa o registro de routers e se auto-apaga.
