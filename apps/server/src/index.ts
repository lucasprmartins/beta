import { apiHandler, rpcHandler } from "@app/api";
import { auth, createContext } from "@app/auth/server";
import { env, isLocal } from "@app/infra/env";
import { logger } from "@app/infra/logger";
import { cors } from "@elysiajs/cors";
import { sql } from "bun";
import { Elysia } from "elysia";
import type { Generator } from "elysia-rate-limit";
import { rateLimit } from "elysia-rate-limit";

const PORT = 3000;
const RPC_RATE_LIMIT = { duration: 60_000, max: 120 } as const;

const rateLimitGenerator: Generator = (request, server) => {
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (forwardedFor) {
    return forwardedFor;
  }

  return server?.requestIP(request)?.address ?? "unknown-client";
};

new Elysia()

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

  .use((app) =>
    isLocal
      ? app.use(
          cors({
            origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : [],
            methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization"],
            exposeHeaders: ["Content-Length"],
            maxAge: 600,
            credentials: true,
          })
        )
      : app
  )

  // Better-Auth
  .mount(auth.handler)

  // RPC endpoint - para Frontend
  .group("/rpc", (rpc) =>
    rpc
      .use(
        rateLimit({
          duration: RPC_RATE_LIMIT.duration,
          max: RPC_RATE_LIMIT.max,
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

  // API REST + OpenAPI — apenas em desenvolvimento
  .use((app) =>
    isLocal
      ? app.group("/api", (api) =>
          api.all(
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
      : app
  )
  .listen(PORT, () => {
    logger.info("servidor executado");
  });
