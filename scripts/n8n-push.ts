import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  type ConfigN8n,
  carregarEnv,
  listarWorkflows,
  N8N_DIR,
  requisicaoN8n,
  type TagN8n,
  type WorkflowLimpo,
  type WorkflowRemoto,
} from "./n8n-shared";

async function lerWorkflowsLocais(): Promise<WorkflowLimpo[]> {
  let arquivos: string[];
  try {
    const entries = await readdir(N8N_DIR);
    arquivos = entries.filter((f) => f.endsWith(".json"));
  } catch {
    console.error("Pasta n8n/ não encontrada. Execute bun n8n:pull primeiro.");
    process.exit(1);
  }

  const workflows: WorkflowLimpo[] = [];
  for (const arquivo of arquivos) {
    const conteudo = await readFile(join(N8N_DIR, arquivo), "utf-8");
    workflows.push(JSON.parse(conteudo) as WorkflowLimpo);
  }
  return workflows;
}

async function buscarOuCriarTag(config: ConfigN8n): Promise<string> {
  const body = await requisicaoN8n<{ data: TagN8n[] }>(
    config,
    "GET",
    "/api/v1/tags?limit=100"
  );

  const existente = body.data.find((t) => t.name === config.tag);
  if (existente) {
    return existente.id;
  }

  const nova = await requisicaoN8n<TagN8n>(config, "POST", "/api/v1/tags", {
    name: config.tag,
  });
  console.log(`Tag "${config.tag}" criada (${nova.id})`);
  return nova.id;
}

async function criarWorkflow(
  config: ConfigN8n,
  workflow: WorkflowLimpo
): Promise<string> {
  const criado = await requisicaoN8n<WorkflowRemoto>(
    config,
    "POST",
    "/api/v1/workflows",
    workflow
  );
  return criado.id;
}

async function atualizarWorkflow(
  config: ConfigN8n,
  id: string,
  workflow: WorkflowLimpo
): Promise<void> {
  await requisicaoN8n(config, "PUT", `/api/v1/workflows/${id}`, workflow);
}

async function associarTag(
  config: ConfigN8n,
  workflowId: string,
  tagId: string
): Promise<void> {
  await requisicaoN8n(config, "PUT", `/api/v1/workflows/${workflowId}/tags`, [
    { id: tagId },
  ]);
}

async function main() {
  const config = await carregarEnv();

  const locais = await lerWorkflowsLocais();

  if (locais.length === 0) {
    console.log("Nenhum arquivo .json encontrado em n8n/.");
    return;
  }

  console.log(
    `Enviando ${locais.length} workflow(s) para ${config.baseUrl}...`
  );

  const remotos = await listarWorkflows(config);
  const tagId = await buscarOuCriarTag(config);

  let criados = 0;
  let atualizados = 0;
  let erros = 0;

  for (const local of locais) {
    const remoto = remotos.find((r) => r.name === local.name);

    try {
      if (remoto) {
        await atualizarWorkflow(config, remoto.id, local);
        console.log(`  [atualizado] ${local.name}`);
        atualizados++;
      } else {
        const novoId = await criarWorkflow(config, local);
        await associarTag(config, novoId, tagId);
        console.log(`  [criado] ${local.name}`);
        criados++;
      }
    } catch (err) {
      console.error(
        `  [erro] ${local.name}: ${err instanceof Error ? err.message : err}`
      );
      erros++;
    }
  }

  console.log(
    `\nConcluído! ${criados} criado(s), ${atualizados} atualizado(s), ${erros} erro(s).`
  );

  if (erros > 0) {
    process.exit(1);
  }
}

main();
