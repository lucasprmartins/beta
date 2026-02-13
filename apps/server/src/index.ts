import { apiHandler, rpcHandler } from "@app/api";
import { auth, createContext } from "@app/auth/server";
import { env } from "@app/infra/env";
import { logger } from "@app/infra/logger";
import { cors } from "@elysiajs/cors";
import { sql } from "bun";
import { Elysia } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { RATE_LIMITS, rateLimitGenerator } from "./rate-limit";

const URL = env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${env.RAILWAY_PUBLIC_DOMAIN}`
  : "http://localhost";
const PORT = 3000;

new Elysia()
  .headers({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), camera=(), microphone=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  })

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

  .use(
    cors({
      origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : [],
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    })
  )

  // Better-Auth
  .mount(auth.handler)

  // RPC endpoint - para Frontend
  .group("/rpc", (app) =>
    app
      .use(
        rateLimit({
          duration: RATE_LIMITS.rpc.duration,
          max: RATE_LIMITS.rpc.max,
          generator: rateLimitGenerator,
          scoping: "scoped",
        })
      )
      .all(
        "/*",
        async ({ request }) => {
          const context = await createContext({ request });
          const { response } = await rpcHandler.handle(request, {
            prefix: "/rpc",
            context,
          });

          return response ?? new Response("NOT FOUND", { status: 404 });
        },
        {
          parse: "none",
        }
      )
  )

  // API endpoint - REST
  .group("/api", (app) =>
    app
      .use(
        rateLimit({
          duration: RATE_LIMITS.api.duration,
          max: RATE_LIMITS.api.max,
          generator: rateLimitGenerator,
          scoping: "scoped",
        })
      )
      .all(
        "/*",
        async ({ request }) => {
          const context = await createContext({ request });
          const { response } = await apiHandler.handle(request, {
            prefix: "/api",
            context,
          });

          return response ?? new Response("NOT FOUND", { status: 404 });
        },
        {
          parse: "none",
        }
      )
  )

  .listen(PORT, () => {
    const isLocal = URL.includes("localhost");
    const baseUrl = isLocal ? `${URL}:${PORT}` : URL;
    logger.info("servidor executado");
    logger.info({ url: `${baseUrl}/api/` }, "documentação disponível");
  });
