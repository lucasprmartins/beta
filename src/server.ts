import cors from "cors";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { pinoHttp } from "pino-http";
import { auth } from "./auth";
import { corsOrigins, isLocal } from "./config/env";
import { logger } from "./config/logger";
import { healthRouter } from "./routes/health";

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
  app.use(express.json());

  app.get("/", (_request, response) => {
    response.json({ status: "ok", service: "beta-node" });
  });

  app.use("/health", healthRouter);

  return app;
}
