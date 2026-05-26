import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { log } from "@clack/prompts";
import pc from "picocolors";

import { commandExists, projectRoot, run, runChecked } from "./utils";

const ROOT = projectRoot();
const MIN_NODE = 26;

export function checkNodeVersion(): void {
  const major = Number(process.versions.node.split(".")[0] ?? 0);

  if (major < MIN_NODE) {
    throw new Error(
      `Node.js >= ${MIN_NODE} requerido. Versão atual: ${process.version}`
    );
  }
}

export function checkNodeModules(): void {
  if (!existsSync(resolve(ROOT, "node_modules"))) {
    throw new Error(
      `node_modules não encontrado. Execute ${pc.cyan("pnpm install")} antes do setup.`
    );
  }
}

export async function checkPnpm(): Promise<void> {
  if (!(await commandExists("pnpm"))) {
    throw new Error(
      `pnpm não instalado. Instale em ${pc.underline(pc.cyan("https://pnpm.io/installation"))}.`
    );
  }
}

export async function checkGh(): Promise<void> {
  if (!(await commandExists("gh"))) {
    throw new Error(
      `GitHub CLI (gh) não instalado. Instale em ${pc.underline(pc.cyan("https://cli.github.com"))}.`
    );
  }

  const { exitCode } = await run("gh", ["auth", "status"], { quiet: true });
  if (exitCode !== 0) {
    throw new Error(
      `GitHub CLI não autenticado. Execute ${pc.cyan("gh auth login")}.`
    );
  }
}

export async function checkDocker(): Promise<void> {
  if (!(await commandExists("docker"))) {
    throw new Error(
      `Docker não instalado. Instale em ${pc.underline(pc.cyan("https://www.docker.com/"))}.`
    );
  }

  const { exitCode } = await run("docker", ["info"], { quiet: true });
  if (exitCode !== 0) {
    throw new Error(
      "Docker daemon não está respondendo. Inicie o Docker Desktop e tente novamente."
    );
  }
}

export async function runPreflight(): Promise<void> {
  checkNodeModules();
  log.success("node_modules presente");

  checkNodeVersion();
  log.success("Node.js version OK");

  await Promise.all([
    checkPnpm().then(() => log.success("pnpm presente")),
    checkGh().then(() => log.success("GitHub CLI autenticado")),
    checkDocker().then(() => log.success("Docker daemon ativo")),
  ]);

  await runChecked("pnpm", ["--version"], { quiet: true });
}
