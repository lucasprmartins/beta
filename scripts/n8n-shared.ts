import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

export interface ConfigN8n {
  baseUrl: string;
  apiKey: string;
  tag: string;
}

export interface TagN8n {
  id: string;
  name: string;
}

export interface WorkflowRemoto {
  id: string;
  name: string;
  active: boolean;
  tags: TagN8n[];
  nodes: unknown[];
  connections: Record<string, unknown>;
  settings: Record<string, unknown>;
  [key: string]: unknown;
}

export interface WorkflowLimpo {
  name: string;
  nodes: unknown[];
  connections: Record<string, unknown>;
  settings: Record<string, unknown>;
}

const SCRIPTS_DIR = import.meta.dirname;
const ROOT_DIR = resolve(SCRIPTS_DIR, "..");

export const N8N_DIR = join(ROOT_DIR, "n8n");

export const CAMPOS_WORKFLOW = [
  "name",
  "nodes",
  "connections",
  "settings",
] as const;

export async function carregarEnv(): Promise<ConfigN8n> {
  const envPath = join(SCRIPTS_DIR, ".env");
  const envContent = await readFile(envPath, "utf-8");
  const vars: Record<string, string> = {};

  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    vars[key] = value;
  }

  const baseUrl = vars.N8N_URL;
  const apiKey = vars.N8N_API_KEY;
  const tag = vars.N8N_PROJECT_TAG;

  if (!(baseUrl && apiKey && tag)) {
    console.error(
      "Variáveis N8N_URL, N8N_API_KEY e N8N_PROJECT_TAG são obrigatórias no scripts/.env"
    );
    process.exit(1);
  }

  return { baseUrl, apiKey, tag };
}

export function slugificar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function requisicaoN8n<T>(
  config: ConfigN8n,
  metodo: string,
  caminho: string,
  corpo?: unknown
): Promise<T> {
  const url = new URL(caminho, config.baseUrl);

  const headers: Record<string, string> = {
    accept: "application/json",
    "X-N8N-API-KEY": config.apiKey,
  };

  const opcoes: RequestInit = { method: metodo, headers };

  if (corpo !== undefined) {
    headers["content-type"] = "application/json";
    opcoes.body = JSON.stringify(corpo);
  }

  const response = await fetch(url.toString(), opcoes);

  if (!response.ok) {
    const texto = await response.text();
    throw new Error(`${metodo} ${caminho} falhou: ${response.status} ${texto}`);
  }

  return response.json() as Promise<T>;
}

export async function listarWorkflows(
  config: ConfigN8n
): Promise<WorkflowRemoto[]> {
  const url = `/api/v1/workflows?tags=${encodeURIComponent(config.tag)}&limit=100`;
  const body = await requisicaoN8n<{ data: WorkflowRemoto[] }>(
    config,
    "GET",
    url
  );
  return body.data;
}

export async function buscarWorkflow(
  config: ConfigN8n,
  id: string
): Promise<WorkflowRemoto> {
  return await requisicaoN8n<WorkflowRemoto>(
    config,
    "GET",
    `/api/v1/workflows/${id}`
  );
}

export function limparWorkflow(workflow: WorkflowRemoto): WorkflowLimpo {
  const limpo = {} as Record<string, unknown>;
  for (const campo of CAMPOS_WORKFLOW) {
    if (campo in workflow) {
      limpo[campo] = workflow[campo];
    }
  }
  return limpo as WorkflowLimpo;
}
