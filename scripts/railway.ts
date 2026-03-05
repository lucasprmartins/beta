import { intro, log, outro, spinner, text } from "@clack/prompts";
import { $ } from "bun";
import { comandoExiste, raizProjeto, verificarCancelamento } from "./lib/utils";

export async function linkRailway(): Promise<void> {
  if (!(await comandoExiste("railway"))) {
    log.error(
      "Railway CLI não está instalado. Instale em: https://docs.railway.com/guides/cli"
    );
    process.exit(1);
  }

  const { exitCode } = await $`railway status`.nothrow().quiet();
  if (exitCode === 0) {
    log.success("Projeto já está vinculado");
    return;
  }

  const workspace = await text({
    message: "Nome do workspace Railway:",
    validate: (valor) => {
      if (!valor) {
        return "Nome do workspace é obrigatório.";
      }
    },
  });
  verificarCancelamento(workspace);

  const projeto = await text({
    message: "Nome do projeto no Railway:",
    validate: (valor) => {
      if (!valor) {
        return "Nome do projeto é obrigatório.";
      }
    },
  });
  verificarCancelamento(projeto);

  const s = spinner();
  s.start(`Vinculando projeto ${projeto} no workspace ${workspace}...`);
  await $`railway link -p ${projeto} -w ${workspace}`.quiet();
  s.stop("Projeto vinculado com sucesso");
}

if (import.meta.main) {
  process.chdir(raizProjeto());
  intro("Railway Link");
  await linkRailway();
  outro("Railway vinculado!");
}
