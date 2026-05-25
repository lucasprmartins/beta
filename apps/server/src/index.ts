import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { pinoHttp } from "pino-http";
import { auth } from "./auth";
import { createContext } from "./auth/context";
import { corsOrigins, env, isLocal } from "./config/env";
import { logger } from "./config/logger";
import { apiHandler, rpcHandler } from "./routes/lib/orpc";
import { healthRouter } from "./routes/health";

const app = express();

app.use(
  pinoHttp({
    logger,
    customLogLevel(request, response, error) {
      if (error || response.statusCode >= 500) {
        return "error";
      }

      if (response.statusCode >= 400) {
        return "warn";
      }

      if (request.method === "OPTIONS" || request.url === "/health") {
        return "debug";
      }

      return "info";
    },
    customSuccessMessage(request, response, responseTime) {
      return `${request.method} ${request.url} ${response.statusCode} ${Math.round(responseTime)}ms`;
    },
    customErrorMessage(request, response, error) {
      return `${request.method} ${request.url} ${response.statusCode} ${error.message}`;
    },
    serializers: {
      req(request) {
        return {
          id: request.id,
          method: request.method,
          url: request.url,
          origin: request.headers.origin,
          userAgent: request.headers["user-agent"],
        };
      },
      res(response) {
        return {
          statusCode: response.statusCode,
        };
      },
    },
  })
);

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

app.get("/", (_request, response) => {
  response.json({ status: "ok", service: "beta-node" });
});

app.use("/health", healthRouter);

app.use("/rpc{/*path}", async (request, response, next) => {
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
