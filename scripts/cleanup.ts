import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";
import { intro, log, outro } from "@clack/prompts";
import { ARQUIVOS_EXEMPLO } from "./lib/constants";
import { raizProjeto, removerLinhasDoArquivo } from "./lib/utils";

const root = raizProjeto();
process.chdir(root);

intro("Cleanup de Exemplos");

for (const arquivo of ARQUIVOS_EXEMPLO) {
  const caminho = resolve(root, arquivo);
  if (existsSync(caminho)) {
    unlinkSync(caminho);
  }
}
log.success("Arquivos de exemplo removidos");

const indexPath = resolve(root, "packages/api/src/index.ts");
if (existsSync(indexPath)) {
  await removerLinhasDoArquivo(indexPath, [
    /example-crud/,
    /example-domain/,
    /categoria.*categoriaRouter/,
    /produto.*produtoRouter/,
  ]);
  log.success("Imports limpos em packages/api/src/index.ts");
} else {
  log.info("packages/api/src/index.ts não encontrado, pulando");
}

outro("Exemplos removidos!");
