import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { pinoHttp } from "pino-http";
import { auth } from "./auth";
import { createContext } from "./auth/context";
import { corsOrigins, isLocal } from "./config/env";
import { logger } from "./config/logger";
import { healthRouter } from "./routes/health";
import { apiHandler, rpcHandler } from "./routes/config/orpc";

export function createServer() {
  const app = express();

  app.use(
    pinoHttp({
      logger,
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

  return app;
}
