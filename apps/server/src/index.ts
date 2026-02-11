import { apiHandler, rpcHandler } from "@app/api";
import { auth, createContext } from "@app/auth/server";
import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { rateLimit } from "elysia-rate-limit";
import { RATE_LIMITS, rateLimitGenerator } from "./rate-limit";

const URL = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : "http://localhost";
const PORT = 3000;

new Elysia()
  .headers({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), camera=(), microphone=()",
  })

  .get("/", () => "OK")

  .use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") ?? [],
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
    console.log("🔋 Servidor executado!");
    console.log(`🌏 Acesse ${baseUrl}/api/ para conferir a documentação.`);
  });
