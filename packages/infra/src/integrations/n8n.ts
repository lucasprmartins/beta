import { logger } from "../logger";

interface WorkflowHandler<TPayload, TResposta = void> {
  workflow(payload: TPayload, retorno: false): Promise<void>;
  workflow(payload: TPayload, retorno: true): Promise<TResposta>;
  workflow(payload: TPayload, retorno: boolean): Promise<TResposta | undefined>;
}

export class N8n {
  private readonly baseUrl: string;
  private readonly token?: string;

  constructor(baseUrl: string, token?: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  path<TPayload>(path: string): WorkflowHandler<TPayload>;
  path<TPayload, TResposta>(path: string): WorkflowHandler<TPayload, TResposta>;
  path<TPayload, TResposta = void>(
    path: string
  ): WorkflowHandler<TPayload, TResposta> {
    const url = `${this.baseUrl}${path}`;
    const token = this.token;

    return {
      async workflow(payload: TPayload, retorno: boolean) {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          logger.error(
            { status: response.status, url },
            "erro ao executar workflow n8n"
          );
          return;
        }

        if (retorno) {
          return (await response.json()) as TResposta;
        }
      },
    } as WorkflowHandler<TPayload, TResposta>;
  }
}

// Exemplo de uso:
// import { env } from "../env";
// const n8n = new N8n(env.N8N_WEBHOOK_URL!, env.N8N_WEBHOOK_TOKEN);
//
// export const workflows = {
//   compraRealizada: n8n.path<CompraPayload>("/compra-realizada"),
//   gerarRelatorio: n8n.path<RelatorioPayload, RelatorioResposta>("/gerar-relatorio"),
// };
