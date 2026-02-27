<div align="center">

<img src="https://raw.githubusercontent.com/lucasprmartins/beta/main/apps/web/public/logo-1.svg" alt="Beta" width="80" />

**Template full-stack TypeScript com arquitetura limpa em monorepo.**

<a href="https://bun.sh/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bun/bun-original.svg" width="30" title="Bun" alt="Bun" /></a>&nbsp;&nbsp;
<a href="https://www.typescriptlang.org/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" width="30" title="TypeScript" alt="TypeScript" /></a>&nbsp;&nbsp;
<a href="https://react.dev/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="30" title="React" alt="React" /></a>&nbsp;&nbsp;
<a href="https://vitejs.dev/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="30" title="Vite" alt="Vite" /></a>&nbsp;&nbsp;
<a href="https://tailwindcss.com/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="30" title="Tailwind CSS" alt="Tailwind CSS" /></a>&nbsp;&nbsp;
<a href="https://www.postgresql.org/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="30" title="PostgreSQL" alt="PostgreSQL" /></a>

[Começando](#começando) · [Stack](#stack) · [Estrutura](#estrutura) · [Scripts](#scripts)

</div>

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| **Runtime** | Bun |
| **Monorepo** | Turborepo |
| **Server** | Elysia |
| **Frontend** | React 19, Vite, Tailwind CSS, DaisyUI |
| **Roteamento** | TanStack Router (file-based) |
| **Estado** | TanStack Query |
| **API** | oRPC (type-safe RPC + REST/OpenAPI) |
| **Banco de dados** | PostgreSQL + Drizzle ORM |
| **Autenticação** | Better Auth |
| **Validação** | Zod |
| **Linting** | Biome (Ultracite) |

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
| **Infra** | Schemas Drizzle, repositórios e integrações |
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

2. Instale as dependências e execute o inicializador:

   ```bash
   cd <nome-do-projeto>
   bun install && bun setup
   ```

O script pergunta o nome do projeto, o owner (pessoal ou organização) e se deseja usar Railway. Em seguida, cria um repositório GitHub privado e faz o commit inicial. Se Railway for selecionado, a infra é provisionada automaticamente com PostgreSQL incluso na nuvem.

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

## Scripts

| Comando | Descrição |
|---|---|
| `bun dev` | Inicia todos os apps em modo desenvolvimento |
| `bun dev:server` | Inicia apenas o servidor |
| `bun dev:web` | Inicia apenas o frontend |
| `bun run build` | Build de produção |
| `bun run build:server` | Build apenas do servidor |
| `bun run build:web` | Build apenas do frontend |
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
