import "dotenv/config";
import pino from "pino";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  PORT: z.coerce.number().int().positive().optional().default(3000),
  CORS_ORIGIN: z.string().optional().default(""),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .optional()
    .default("development"),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error", "fatal"])
    .optional()
    .default("info"),
  DISABLE_PUBLIC_SIGNUP: z.coerce.boolean().optional().default(true),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  const bootLogger = pino({
    level: "fatal",
    formatters: { level: (label) => ({ level: label }) },
    timestamp: pino.stdTimeFunctions.isoTime,
  });

  for (const issue of result.error.issues) {
    bootLogger.fatal(
      { field: issue.path.join("."), error: issue.message },
      "invalid environment variable"
    );
  }

  process.exit(1);
}

export const env = result.data;
export const isLocal = env.NODE_ENV !== "production";
export const corsOrigins = env.CORS_ORIGIN
  ? env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : [];
