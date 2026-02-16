---
paths:
  - "apps/server/**/*.ts"
---

# Server (Elysia)

Servidor HTTP usando Elysia sobre Bun.

## Estrutura

```
apps/server/src/
├── index.ts         # Entry point + middlewares + rotas
└── rate-limit.ts    # Rate limiter por IP
```

## Health Check

```typescript
.get("/", async () => {
  try {
    await sql`SELECT 1`;
    return { status: "ok", db: "connected" };
  } catch (err) {
    logger.error({ err }, "health check falhou: banco indisponível");
    return new Response(
      JSON.stringify({ status: "error", db: "disconnected" }),
      { status: 503 }
    );
  }
})
```

- `GET /` → `{ status: "ok", db: "connected" }` (200) ou `{ status: "error", db: "disconnected" }` (503)

## Security Headers

Aplicados globalmente a todas as respostas:

```typescript
.headers({
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), camera=(), microphone=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
})
```

O endpoint `/api` tem CSP mais permissivo (permite CDN para documentação OpenAPI).

## CORS

```typescript
cors({
  origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : [],
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
})
```

- Origens configuradas via `CORS_ORIGIN` (separadas por vírgula)
- `credentials: true` — cookies enviados cross-origin

## Rate Limiting

| Tier | Duração | Max Requests | Uso |
|------|---------|-------------|-----|
| RPC | 60s | 120 | Frontend (`/rpc`) |
| API | 60s | 60 | REST (`/api`) |

Identificação por IP via `x-forwarded-for` → `requestIP()` → `"unknown-client"`.

## Arquitetura de Handlers

```
Elysia
├── .headers()            # Security headers globais
├── GET /                 # Health check
├── .use(cors)            # CORS middleware
├── .mount(auth.handler)  # Better Auth (monta em /auth/*)
├── /rpc/*                # Frontend RPC
│   ├── rateLimit(120/60s)
│   └── rpcHandler.handle(request, { prefix: "/rpc", context })
└── /api/*                # REST + OpenAPI docs
    ├── CSP permissivo
    ├── rateLimit(60/60s)
    └── apiHandler.handle(request, { prefix: "/api", context })
```

- **Auth montado primeiro** — intercepta `/auth/*` antes dos outros handlers
- **Context criado por request**: `createContext({ request })` extrai sessão dos cookies
- **`parse: "none"`** — handlers gerenciam parsing (oRPC faz o parse internamente)

## URL do Servidor

```typescript
const URL = env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${env.RAILWAY_PUBLIC_DOMAIN}`
  : "http://localhost";
const PORT = 3000;
```

Em produção (Railway), usa domínio público com HTTPS. Local, usa `http://localhost:3000`.
