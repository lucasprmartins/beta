import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { intro, log, outro, select } from "@clack/prompts";
import { $ } from "bun";
import {
  comandoExiste,
  escreverArquivo,
  lerJson,
  raizProjeto,
  substituirNoArquivo,
  verificarCancelamento,
} from "./lib/utils";

const root = raizProjeto();
process.chdir(root);

intro("Configurar Ambiente");

// ─── Detectar Railway ──────────────────────────────────────────────────────────

const configPath = resolve(root, "config.json");
const temConfig = existsSync(configPath);

interface ProjectConfig {
  railway?: { workspace: string };
}

const usaRailway = temConfig
  ? Boolean((await lerJson<ProjectConfig>(configPath)).railway)
  : false;

// ─── Railway (link + ambiente) ─────────────────────────────────────────────────

if (usaRailway) {
  if (!(await comandoExiste("railway"))) {
    log.error(
      "Railway CLI não está instalado. Instale em: https://docs.railway.com/guides/cli"
    );
    process.exit(1);
  }

  let statusJson = (
    await $`railway status --json`.nothrow().quiet()
  ).stdout.toString();

  if (statusJson.includes("No linked project found")) {
    log.warn("Nenhum projeto Railway vinculado. Linkando automaticamente...");
    const { linkRailway } = await import("./railway");
    await linkRailway();
    statusJson = (
      await $`railway status --json`.nothrow().quiet()
    ).stdout.toString();
  }

  let status: {
    environments: { edges: Array<{ node: { name: string } }> };
  };

  try {
    status = JSON.parse(statusJson);
  } catch {
    log.error(
      "Falha ao obter status do Railway. Verifique se está autenticado: railway login"
    );
    process.exit(1);
  }

  log.success("Projeto detectado.");

  const ambientes = status.environments.edges.map((e) => ({
    value: e.node.name,
    label: e.node.name,
  }));

  if (ambientes.length === 0) {
    log.error("Nenhum ambiente encontrado no projeto.");
    process.exit(1);
  }

  const ambiente = await select({
    message: "Selecione o ambiente:",
    options: ambientes,
  });
  verificarCancelamento(ambiente);

  await $`railway environment ${ambiente}`.quiet();
}

// ─── Criar .env se não existir ─────────────────────────────────────────────────

let criouServer = false;
const serverEnvPath = resolve(root, "apps/server/.env");
const webEnvPath = resolve(root, "apps/web/.env");

if (existsSync(serverEnvPath)) {
  log.info("apps/server/.env já existe, mantendo");
} else {
  await escreverArquivo(
    serverEnvPath,
    [
      "DATABASE_URL=",
      "BETTER_AUTH_SECRET=",
      "BETTER_AUTH_URL=http://localhost:3000",
      "CORS_ORIGIN=http://localhost:3001",
      "LOG_LEVEL=debug",
      "",
    ].join("\n")
  );
  criouServer = true;
  log.success("apps/server/.env criado");
}

if (existsSync(webEnvPath)) {
  log.info("apps/web/.env já existe, mantendo");
} else {
  await escreverArquivo(
    webEnvPath,
    ["VITE_SERVER_URL=http://localhost:3000", "VITE_DEVTOOLS=true", ""].join(
      "\n"
    )
  );
  log.success("apps/web/.env criado");
}

// ─── Gerar BETTER_AUTH_SECRET ──────────────────────────────────────────────────

if (criouServer) {
  const secret = randomBytes(32).toString("base64");
  await substituirNoArquivo(serverEnvPath, [
    { de: /^BETTER_AUTH_SECRET=.*$/m, para: `BETTER_AUTH_SECRET=${secret}` },
  ]);
  log.success("BETTER_AUTH_SECRET gerado");
} else {
  log.info("BETTER_AUTH_SECRET mantido (já existente)");
}

// ─── DATABASE_URL via Railway ──────────────────────────────────────────────────

if (usaRailway) {
  const kvOutput = (
    await $`railway variables --kv --service=postgres`.nothrow().quiet()
  ).stdout.toString();
  const match = kvOutput.match(/^DATABASE_PUBLIC_URL=(.+)$/m);

  if (match?.[1]) {
    await substituirNoArquivo(serverEnvPath, [
      { de: /^DATABASE_URL=.*$/m, para: `DATABASE_URL=${match[1]}` },
    ]);
    log.success("DATABASE_URL configurado via Railway");
  } else {
    log.warn("DATABASE_URL não encontrado no Railway, aguarde o deploy.");
  }
} else {
  log.info("Preencha o DATABASE_URL manualmente em apps/server/.env");
}

outro("Ambiente configurado!");
