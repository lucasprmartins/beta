import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../env";

let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) {
    return client;
  }

  const { S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } =
    env;

  if (!(S3_ENDPOINT && S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY)) {
    throw new Error(
      "Variáveis S3 não configuradas. Defina S3_ENDPOINT, S3_ACCESS_KEY_ID e S3_SECRET_ACCESS_KEY."
    );
  }

  client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
  });

  return client;
}

function getBucket(): string {
  if (!env.S3_BUCKET) {
    throw new Error("Variável S3_BUCKET não configurada.");
  }
  return env.S3_BUCKET;
}

export async function gerarUrlUpload(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getBucket(),
    Key: key,
    ContentType: contentType,
  });
  return await getSignedUrl(getClient(), command, { expiresIn });
}

export async function gerarUrlDownload(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  return await getSignedUrl(getClient(), command, { expiresIn });
}

export async function removerObjeto(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: getBucket(),
    Key: key,
  });
  await getClient().send(command);
}

export async function listarObjetos(
  prefix?: string
): Promise<ListObjectsV2CommandOutput> {
  const command = new ListObjectsV2Command({
    Bucket: getBucket(),
    Prefix: prefix,
  });
  return await getClient().send(command);
}
