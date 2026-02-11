import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  buscarWorkflow,
  carregarEnv,
  limparWorkflow,
  listarWorkflows,
  N8N_DIR,
  slugificar,
} from "./n8n-shared";

async function main() {
  const config = await carregarEnv();

  console.log(`Buscando workflows com a tag "${config.tag}"...`);

  const workflows = await listarWorkflows(config);

  if (workflows.length === 0) {
    console.log("Nenhum workflow encontrado com essa tag.");
    return;
  }

  console.log(`${workflows.length} workflow(s) encontrado(s). Baixando...`);

  await mkdir(N8N_DIR, { recursive: true });

  for (const wf of workflows) {
    const completo = await buscarWorkflow(config, wf.id);
    const limpo = limparWorkflow(completo);
    const fileName = `${slugificar(limpo.name)}.json`;
    const filePath = join(N8N_DIR, fileName);

    await writeFile(filePath, JSON.stringify(limpo, null, 2));
    console.log(`  [ok] ${limpo.name} -> ${fileName}`);
  }

  console.log(`\nConcluído! ${workflows.length} workflow(s) salvo(s) em n8n/`);
}

main();
