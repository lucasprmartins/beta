import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { intro, log, outro, spinner } from "@clack/prompts";
import { $ } from "bun";
import { comandoExiste, lerJson, raizProjeto } from "./lib/utils";

interface ProjectConfig {
  name: string;
  railway?: { workspace: string };
}

export async function linkRailway(): Promise<void> {
  const root = raizProjeto();

  if (!(await comandoExiste("railway"))) {
    log.error(
      "Railway CLI não está instalado. Instale em: https://docs.railway.com/guides/cli"
    );
    process.exit(1);
  }

  const configPath = resolve(root, "config.json");
  if (!existsSync(configPath)) {
    log.error("config.json não encontrado. Execute o setup primeiro.");
    process.exit(1);
  }

  const config = await lerJson<ProjectConfig>(configPath);
  if (!config.railway?.workspace) {
    log.error("Workspace Railway não configurado no config.json.");
    process.exit(1);
  }

  const { exitCode } = await $`railway status`.nothrow().quiet();
  if (exitCode === 0) {
    log.success("Projeto já está vinculado");
  } else {
    const s = spinner();
    s.start(
      `Vinculando projeto ${config.name} no workspace ${config.railway.workspace}...`
    );
    await $`railway link -p ${config.name} -w ${config.railway.workspace}`.quiet();
    s.stop("Projeto vinculado com sucesso");
  }
}

if (import.meta.main) {
  process.chdir(raizProjeto());
  intro("Railway Link");
  await linkRailway();
  outro("Railway vinculado!");
}
