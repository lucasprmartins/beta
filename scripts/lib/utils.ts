import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { cancel, isCancel } from "@clack/prompts";
import { $ } from "bun";

export function verificarCancelamento<T>(
  valor: T,
  mensagem = "Operação cancelada."
): asserts valor is Exclude<T, symbol> {
  if (isCancel(valor)) {
    cancel(mensagem);
    process.exit(0);
  }
}

export async function comandoExiste(comando: string): Promise<boolean> {
  const { exitCode } = await $`command -v ${comando}`.nothrow().quiet();
  if (exitCode === 0) {
    return true;
  }
  const { exitCode: exitCode2 } = await $`where ${comando}`.nothrow().quiet();
  return exitCode2 === 0;
}

export function lerArquivo(caminho: string): Promise<string> {
  return readFile(caminho, "utf-8");
}

export async function escreverArquivo(
  caminho: string,
  conteudo: string
): Promise<void> {
  await writeFile(caminho, conteudo);
}

export function lerJson<T = unknown>(caminho: string): Promise<T> {
  return readFile(caminho, "utf-8").then((c) => JSON.parse(c) as T);
}

export async function escreverJson(
  caminho: string,
  dados: unknown
): Promise<void> {
  await writeFile(caminho, `${JSON.stringify(dados, null, 2)}\n`);
}

export async function substituirNoArquivo(
  caminho: string,
  buscas: Array<{ de: string | RegExp; para: string }>
): Promise<void> {
  let conteudo = await lerArquivo(caminho);
  for (const { de, para } of buscas) {
    if (typeof de === "string") {
      conteudo = conteudo.replaceAll(de, para);
    } else {
      conteudo = conteudo.replace(de, para);
    }
  }
  await escreverArquivo(caminho, conteudo);
}

export async function removerLinhasDoArquivo(
  caminho: string,
  padroes: RegExp[]
): Promise<void> {
  const conteudo = await lerArquivo(caminho);
  const linhas = conteudo
    .split("\n")
    .filter((linha) => !padroes.some((padrao) => padrao.test(linha)));
  await escreverArquivo(caminho, linhas.join("\n"));
}

export function raizProjeto(): string {
  return resolve(import.meta.dir, "../..");
}
