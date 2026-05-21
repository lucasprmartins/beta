import cors from "cors";
import express from "express";
import { pinoHttp } from "pino-http";
import { corsOrigins, isLocal } from "./config/env.js";
import { logger } from "./config/logger.js";
import { healthRouter } from "./routes/health.js";

export function createServer() {
  const app = express();

  app.use(
    pinoHttp({
      logger,
    })
  );
  app.use(express.json());

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

  app.get("/", (_request, response) => {
    response.json({ status: "ok", service: "beta-node" });
  });

  app.use("/health", healthRouter);

  return app;
}
