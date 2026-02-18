---
paths:
  - "packages/auth/**/*.ts"
  - "apps/web/src/lib/auth.tsx"
---

# Auth (Better Auth)

Autenticação com email/senha e username. O pacote expõe dois módulos: `server.ts` (backend) e `client.ts` (frontend).

## Plugins

| Plugin | Server | Client | Função |
|--------|--------|--------|--------|
| `username` | `username()` | `usernameClient()` | Login por username (3-20 chars) |
| `admin` | `adminPlugin()` | `adminClient()` | Gerenciamento de usuários e roles |
| `openAPI` | `openAPI()` | — | Docs automáticas (apenas dev) |

## Regras

- **Dados extras de usuário** (telefone, bio, avatar): use `additionalFields` do Better Auth — não crie um domínio User separado
- Um domínio User só se justifica com lógica complexa (gamificação, reputação, multi-tenancy)
- O `Context` (sessão) é extraído via `createContext()` e passado a todos os handlers oRPC

## Frontend (`apps/web/src/lib/auth.tsx`)

| Hook | Input | Comportamento |
|------|-------|---------------|
| `useSignIn()` | `{ username, password }` | Login → refetch session → redirect |
| `useSignUp()` | `{ name, email, username, password }` | Registro → refetch session → redirect |
| `useSignOut()` | — | Logout → remove session → redirect |

- Usar `ensureQueryData(sessionOptions)` no `beforeLoad` das rotas protegidas
- AuthProvider configura redirects: `afterSignIn`, `afterSignUp`, `afterSignOut`
