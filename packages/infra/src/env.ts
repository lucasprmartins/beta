import pino from "pino";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  CORS_ORIGIN: z.string().optional().default(""),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error", "fatal"])
    .optional()
    .default("info"),

  S3_ENDPOINT: z.url().optional(),
  S3_REGION: z.string().optional().default("auto"),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().optional(),
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
      { campo: issue.path.join("."), erro: issue.message },
      "variável de ambiente inválida"
    );
  }

  process.exit(1);
}

export const env = result.data;
