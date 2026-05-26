<div align="center">

<img src="apps/client/src/assets/logo-1.svg" alt="Beta" width="200" />
<br><br>


**Template full-stack TypeScript com arquitetura limpa em workspace pnpm.**

<a href="https://nodejs.org/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="30" title="Node.js" alt="Node.js" /></a>&nbsp;&nbsp;
<a href="https://expressjs.com/"><img src="https://cdn.simpleicons.org/express/000000/ffffff" width="30" title="Express" alt="Express" /></a>&nbsp;&nbsp;
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
├── server/        # Backend (Node.js + Express)
└── client/        # Frontend (React 19)

apps/server/src/
├── auth/          # Auth (Better Auth)
├── config/        # Configurações
├── db/            # Database (Drizzle ORM)
├── domain/        # Domínio de negócio
└── routes/        # Rotas da API (oRPC)
```

## Requisitos

- [Node.js](https://nodejs.org/) >= 26
- [pnpm](https://pnpm.io/) >= 11
- [Docker](https://www.docker.com/) *(PostgreSQL local via Docker Compose)*
- [GitHub CLI](https://cli.github.com) (`gh`)

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
   pnpm install && pnpm setup
   ```

## Após o setup

```bash
pnpm dev
```

> O PostgreSQL é iniciado automaticamente via Docker Compose pelo hook `predev` (que chama `pnpm db`).

O servidor roda em `http://localhost:3000` e o frontend em `http://localhost:3001`.
