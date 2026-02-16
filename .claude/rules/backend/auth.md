---
paths:
  - "packages/auth/**/*.ts"
  - "apps/web/src/lib/auth.tsx"
---

# Auth Package

Autenticação usando Better Auth com email/senha e username.

## Estrutura

- `packages/auth/src/server.ts` - Configuração backend (Better Auth + Drizzle)
- `packages/auth/src/client.ts` - Configuração frontend (React)
- `apps/web/src/lib/auth.tsx` - Hooks e providers React

## Plugins

| Plugin | Server | Client | Função |
|--------|--------|--------|--------|
| `username` | `username()` | `usernameClient()` | Login por username (3-20 chars) |
| `admin` | `adminPlugin()` | `adminClient()` | Gerenciamento de usuários e roles |
| `openAPI` | `openAPI()` | — | Documentação automática dos endpoints auth |

## Métodos

- `auth.signIn.username()` - Login
- `auth.signUp.email()` - Registro
- `auth.signOut()` - Logout
- `auth.getSession()` - Sessão atual

## Schema

Tabelas em `@app/infra/db/schema/auth.ts` (schema `auth`):
- **user** - Dados do usuário
- **session** - Sessões ativas
- **account** - Contas de providers
- **verification** - Verificação de email

Todas com RLS habilitado.

## Session

- Expira em 7 dias (`expiresIn: 60 * 60 * 24 * 7`)
- Atualiza a cada 24h (`updateAge: 60 * 60 * 24`)
- Cookie prefix: `app`

## Cookie Settings

```typescript
advanced: {
  cookiePrefix: "app",
  defaultCookieAttributes: {
    sameSite: "none",
    secure: true,
    partitioned: true,
  },
},
```

- `sameSite: "none"` — necessário para cross-origin (frontend e server em domínios/portas diferentes)
- `secure: true` — HTTPS obrigatório
- `partitioned: true` — cookies particionados para privacidade

## Rate Limiting

| Endpoint | Window | Max |
|----------|--------|-----|
| Geral auth | 60s | 100 |
| `/auth/sign-in/*` | 300s (5min) | 5 |
| `/auth/sign-up/*` | 600s (10min) | 3 |

## Context

```typescript
export async function createContext({ request }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  return { session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

O `Context` é passado para todos os handlers do oRPC via middleware.

## Dados extras de usuário

Para campos de perfil (telefone, bio, avatar, etc.), use `additionalFields` do Better Auth em vez de criar um domínio User separado.

- `additionalFields` na config do server adiciona campos à tabela `user`
- `authClient.updateUser()` no client permite editar esses campos
- A sessão retorna os campos extras automaticamente

**Não crie um domínio separado** para dados de perfil — o Better Auth já resolve isso. Um domínio User separado só se justifica quando há lógica de negócio complexa (gamificação, reputação, multi-tenancy).

## Frontend Hooks (`apps/web/src/lib/auth.tsx`)

### sessionOptions

```typescript
export const sessionOptions = queryOptions({
  queryKey: ["session"],
  queryFn: () => auth.getSession().then((r) => r.data),
  staleTime: 1000 * 60 * 5,
});
```

Usar com `ensureQueryData(sessionOptions)` no `beforeLoad` das rotas protegidas.

### Hooks

| Hook | Input | Comportamento |
|------|-------|---------------|
| `useSignIn()` | `{ username, password }` | Login → refetch session → redirect |
| `useSignUp()` | `{ name, email, username, password }` | Registro → refetch session → redirect |
| `useSignOut()` | — | Logout → remove session → redirect |

Todos retornam `useMutation` com `AuthResult<T>`.

### AuthProvider

Provider opcional para configurar redirects e callbacks:

```typescript
<AuthProvider
  redirects={{ afterSignIn: "/dashboard" }}
  onSignInSuccess={() => toast("Bem-vindo!")}
  onError={(err) => toast(err.message)}
>
  {children}
</AuthProvider>
```

Defaults: `afterSignIn: "/dashboard"`, `afterSignUp: "/dashboard"`, `afterSignOut: "/"`.
