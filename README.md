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
├── server/        # Servidor HTTP (Elysia/Bun)
└── web/           # Frontend (React 19 + TanStack)

packages/
├── config/        # Configurações compartilhadas (tsconfig)
├── core/          # Lógica de negócio (sem dependências externas)
├── infra/         # Infraestrutura (DB + Integrações externas)
├── auth/          # Autenticação (Better Auth)
└── api/           # Definição da API (oRPC)
```

### Backend

```
Server (Elysia)
├── Auth → Sessão/Cookies
└── API (oRPC + Middleware)
    └── Application (Use Cases)
        └── Domain (Regras de negócio)
            └── Repository (Core → Infra)
```

| Pacote | Responsabilidade |
|--------|------------------|
| **Core** | Contratos, domínios e use cases. Sem dependências externas |
| **Infra** | Schemas Drizzle, repositórios, storage (S3) e integrações |
| **API** | Routers oRPC com `requireAuth` e `requireRole("admin", ...)` |
| **Auth** | Configuração do Better Auth (server e client) |

### Frontend

| Recurso | Detalhes |
|---------|----------|
| **Roteamento** | File-based com TanStack Router (`src/routes/`) |
| **Rotas protegidas** | Layout `_auth.tsx` com redirect automático |
| **API client** | Type-safe via oRPC + TanStack Query |
| **Estilização** | Tailwind CSS + DaisyUI |
| **Ícones** | Phosphor Icons |

## Requisitos

- [Bun](https://bun.sh) >= 1.3.9
- [GitHub CLI](https://cli.github.com) (`gh`)
- [Railway CLI](https://docs.railway.com/guides/cli) *(opcional — provisiona PostgreSQL e infra na nuvem)*
- PostgreSQL *(necessário apenas sem Railway)*

## Começando

1. Clone o template:

   ```bash
   gh repo clone lucasprmartins/beta <nome-do-projeto>
   ```

   ou

   ```bash
   git clone https://github.com/lucasprmartins/beta.git <nome-do-projeto>
   ```

2. Execute o inicializador:

   ```bash
   cd <nome-do-projeto>
   sh scripts/beta.sh
   ```

O script instala as dependências automaticamente, pergunta o nome do projeto e quais módulos ativar (n8n, Railway), cria um repositório GitHub privado e faz o commit inicial. Se Railway for selecionado, a infra é provisionada automaticamente com PostgreSQL incluso na nuvem.

## Após o setup

### Com Railway

1. Configure as variáveis de ambiente — o `DATABASE_URL` é puxado do Railway automaticamente:

```bash
bun env
```

2. Inicie o ambiente de desenvolvimento — as migrations já foram executadas no pre-deploy do Railway:

```bash
bun dev
```

3. Remova os arquivos de exemplo:

```bash
bun cleanup
```

### Sem Railway

1. Configure as variáveis de ambiente e preencha o `DATABASE_URL` manualmente em `apps/server/.env`:

```bash
bun env
```

2. Aplique o schema no banco local:

```bash
bun db:migrate
```

3. Inicie o ambiente de desenvolvimento:

```bash
bun dev
```

4. Remova os arquivos de exemplo:

```bash
bun cleanup
```

> O `BETTER_AUTH_SECRET` é gerado automaticamente pelo `bun env`.

O servidor roda em `http://localhost:3000` e o frontend em `http://localhost:3001`.

## Desenvolvimento com Railway

Para trabalhar em novas features ou correções, crie uma branch e abra uma Pull Request. O Railway cria automaticamente um ambiente isolado para cada PR com banco de dados e serviços próprios, permitindo testar sem afetar produção.

1. Troque para o ambiente da PR:

```bash
bun env:dev
```

2. Atualize as variáveis locais com o novo ambiente:

```bash
bun env
```

3. Popule o banco da PR com dados de teste:

```bash
bun seed
```

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
| `bun beta` | Inicializa novo projeto a partir do template |
| `bun env` | Configura variáveis de ambiente |
| `bun env:dev` | Troca para ambiente de PR no Railway |
| `bun seed` | Popula banco (Railway ou local) |
| `bun cleanup` | Remove arquivos de exemplo |
