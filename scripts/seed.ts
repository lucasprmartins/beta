import { intro, log, outro, spinner } from "@clack/prompts";
import { $ } from "bun";
import { comandoExiste, raizProjeto } from "./lib/utils";

const root = raizProjeto();
process.chdir(root);

intro("Database Seed");

let usaRailway = false;

if (await comandoExiste("railway")) {
  const result = await $`railway status`.nothrow().quiet();
  const stdout = result.stdout.toString();

  if (result.exitCode === 0 && !stdout.includes("No linked project found")) {
    usaRailway = true;

    if (stdout.includes("production")) {
      log.error(
        "Você está no ambiente de production. Execute 'bun env' para mudar para um ambiente de desenvolvimento."
      );
      process.exit(1);
    }
  }
}

const s = spinner();

if (usaRailway) {
  s.start("Executando seed via Railway...");
  await $`railway run turbo -F @app/infra db:seed`.quiet();
} else {
  log.warn("Railway não configurado, executando seed local");
  s.start("Executando seed...");
  await $`turbo -F @app/infra db:seed`.quiet();
}

s.stop("Seed concluído!");
outro("Seed concluído!");
