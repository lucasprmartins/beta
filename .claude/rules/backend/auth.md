---
paths:
  - "packages/auth/**/*.ts"
---

# Auth Package

Autenticação usando Better Auth com email/senha e username.

## Estrutura

- `server.ts` - Configuração backend (Better Auth + Drizzle)
- `client.ts` - Configuração frontend (React)

## Métodos

- `auth.signIn.username()` - Login
- `auth.signUp.email()` - Registro
- `auth.signOut()` - Logout
- `auth.getSession()` - Sessão atual

## Schema

Tabelas em `@app/infra/db/schema/auth.ts` (schema `better_auth`):
- **user** - Dados do usuário
- **session** - Sessões ativas
- **account** - Contas de providers
- **verification** - Verificação de email

Todas com RLS habilitado.
