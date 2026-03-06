<div align="center">

<img src="https://raw.githubusercontent.com/lucasprmartins/beta/main/apps/web/public/logo-1.svg" alt="Beta" width="200" />
<br><br>


**Template full-stack TypeScript com arquitetura limpa em monorepo.**

<a href="https://bun.sh/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bun/bun-original.svg" width="30" title="Bun" alt="Bun" /></a>&nbsp;&nbsp;
<a href="https://elysiajs.com/"><img src="https://raw.githubusercontent.com/elysiajs/documentation/main/docs/public/assets/elysia.svg" width="30" title="Elysia" alt="Elysia" /></a>&nbsp;&nbsp;
<a href="https://www.better-auth.com/"><img src="https://svgl.app/library/better-auth_dark.svg" width="30" title="Better Auth" alt="Better Auth" /></a>&nbsp;&nbsp;
<a href="https://www.postgresql.org/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" width="30" title="PostgreSQL" alt="PostgreSQL" /></a>&nbsp;&nbsp;
<a href="https://orm.drizzle.team/"><img src="https://cdn.simpleicons.org/drizzle" width="30" title="Drizzle ORM" alt="Drizzle ORM" /></a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="https://tanstack.com/router"><img src="https://tanstack.com/images/logos/logo-color-100.png" width="30" title="TanStack Router" alt="TanStack Router" /></a>&nbsp;&nbsp;
<a href="https://react.dev/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="30" title="React" alt="React" /></a>&nbsp;&nbsp;
<a href="https://tailwindcss.com/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="30" title="Tailwind CSS" alt="Tailwind CSS" /></a>&nbsp;&nbsp;
<a href="https://daisyui.com/"><img src="https://img.daisyui.com/images/daisyui/mark-static.svg" width="30" title="DaisyUI" alt="DaisyUI" /></a>


[Começando](#começando) · [Estrutura](#estrutura) · [Scripts](#scripts)

</div>

---

## Estrutura

```
apps/
├── proxy/         # Proxy reverso (Caddy)
├── server/        # Backend (Elysia)
└── web/           # Frontend (React 19)

packages/
├── core/          # Lógica de negócio
├── infra/         # Banco de Dados e Integrações (Drizzle)
├── api/           # Rotas da API (oRPC)
├── auth/          # Auth (Better Auth)
└── config/        # tsconfig
```

## Requisitos

- [Bun](https://bun.sh) >= 1.3.10
- [Docker](https://www.docker.com/) *(PostgreSQL local via Docker Compose)*
- [GitHub CLI](https://cli.github.com) (`gh`)
- [Railway CLI](https://docs.railway.com/guides/cli) *(opcional — provisiona PostgreSQL e infra na nuvem)*

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

1. Configure as variáveis de ambiente:

```bash
bun env
```

> O script pergunta se deseja usar **Local (Docker)** ou **Railway**. Com Railway, o `DATABASE_URL` é preenchido automaticamente. Com Docker, ele é configurado automaticamente para `postgres://beta:beta@localhost:5432/beta`.

2. Aplique as migrations:

```bash
bun db:migrate
```

3. Inicie o desenvolvimento:

```bash
bun dev
```

> No modo Local, o `bun dev` sobe automaticamente o PostgreSQL via Docker Compose antes de iniciar o server e o web.

4. Remova os arquivos de exemplo:

```bash
bun cleanup
```

> O `BETTER_AUTH_SECRET` é gerado automaticamente pelo `bun env`.

O servidor roda em `http://localhost:3000` e o frontend em `http://localhost:3001`.

## Scripts

| Comando | Descrição |
|---|---|
| `bun dev` | Sobe o PostgreSQL (Docker) e inicia server + web |
| `bun run build` | Build de produção |
| `bun db:local` | Sobe apenas o PostgreSQL via Docker Compose |
| `bun db:migrate` | Executa migrations |
| `bun db:seed` | Popula o banco com dados iniciais |
| `bun db:studio` | Abre o Drizzle Studio |
| `bun lint` | Verifica linting |
| `bun check-types` | Verifica tipos TypeScript |

## Integrações

Integrações opcionais estão disponíveis via [beta-tools](https://github.com/lucasprmartins/beta-tools).

```bash
gh repo clone lucasprmartins/beta-tools
cd beta-tools && bun install && bun beta
```
