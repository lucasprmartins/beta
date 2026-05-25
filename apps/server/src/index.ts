import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import { auth } from "./auth";
import { createContext } from "./auth/context";
import { corsOrigins, env, isLocal } from "./config/env";
import { logger } from "./config/logger";
import { queryClient } from "./db";
import { healthRouter } from "./routes/health";
import { apiHandler, rpcHandler } from "./routes/lib/orpc";

const app = express();
const RPC_RATE_LIMIT = { windowMs: 60_000, limit: 120 } as const;

const rpcRateLimit = rateLimit({
  windowMs: RPC_RATE_LIMIT.windowMs,
  limit: RPC_RATE_LIMIT.limit,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator(request) {
    const forwardedFor = request.headers["x-forwarded-for"];
    if (typeof forwardedFor === "string") {
      const clientIp = forwardedFor.split(",")[0]?.trim();
      if (clientIp) {
        return ipKeyGenerator(clientIp);
      }
    }

    return request.ip ? ipKeyGenerator(request.ip) : "unknown-client";
  },
});

if (isLocal) {
  app.use(
    cors({
      origin: corsOrigins,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      exposedHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    })
  );
}

app.all("/auth/*splat", toNodeHandler(auth));

app.get("/", async (_request, response) => {
  try {
    await queryClient`SELECT 1`;
    response.json({ status: "ok", db: "connected" });
  } catch (err) {
    logger.error({ err }, "health check falhou: banco indisponível");
    response.status(503).json({ status: "error", db: "disconnected" });
  }
});

app.use("/health", healthRouter);

app.use("/rpc{/*path}", rpcRateLimit, async (request, response, next) => {
  const context = await createContext(request.headers);
  const { matched } = await rpcHandler.handle(request, response, {
    prefix: "/rpc",
    context,
  });

  if (matched) {
    return;
  }

  next();
});

if (isLocal) {
  app.use("/api{/*path}", async (request, response, next) => {
    const context = await createContext(request.headers);
    const { matched } = await apiHandler.handle(request, response, {
      prefix: "/api",
      context,
    });

    if (matched) {
      return;
    }

    next();
  });
}

app.use(express.json());

const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "server started");
});

function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, "shutting down server");

  server.close((err) => {
    if (err) {
      logger.error({ err }, "server shutdown failed");
      process.exit(1);
    }

    logger.info("server stopped");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
