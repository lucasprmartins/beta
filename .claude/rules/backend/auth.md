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

## Dados extras de usuário

Para campos de perfil (telefone, bio, avatar, etc.), use `additionalFields` do Better Auth em vez de criar um domínio User separado.

- `additionalFields` na config do server adiciona campos à tabela `user`
- `authClient.updateUser()` no client permite editar esses campos
- A sessão retorna os campos extras automaticamente

**Não crie um domínio separado** para dados de perfil — o Better Auth já resolve isso. Um domínio User separado só se justifica quando há lógica de negócio complexa (gamificação, reputação, multi-tenancy).
