import dotenv from "dotenv";
import "dotenv/config";

dotenv.config({
  path: "../../apps/server/.env",
});

import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "../env";
import { logger } from "../logger";

async function main() {
  const { S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } =
    env;

  if (!(S3_ENDPOINT && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY)) {
    logger.info("Variáveis S3 não configuradas, pulando configuração de CORS");
    return;
  }

  if (!env.S3_BUCKET) {
    logger.info("S3_BUCKET não configurado, pulando configuração de CORS");
    return;
  }

  const origins = env.CORS_ORIGIN.split(",").filter(Boolean);

  if (origins.length === 0) {
    logger.warn(
      "CORS_ORIGIN vazio, nenhuma origem para configurar no bucket S3"
    );
    return;
  }

  const client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
  });

  await client.send(
    new PutBucketCorsCommand({
      Bucket: env.S3_BUCKET,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedOrigins: origins,
            AllowedMethods: ["GET", "PUT", "HEAD", "DELETE"],
            AllowedHeaders: ["Content-Type"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 600,
          },
        ],
      },
    })
  );

  logger.info(
    { bucket: env.S3_BUCKET, origins },
    "CORS configurado no bucket S3"
  );
}

main().catch((err) => {
  logger.error({ err }, "Falha ao configurar CORS no bucket S3");
  process.exit(1);
});
