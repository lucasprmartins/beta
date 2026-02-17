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

        let response: Response;
        try {
          response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(payload),
          });
        } catch (err) {
          logger.error({ err, url }, "erro de rede ao chamar workflow n8n");
          throw err;
        }

        if (!response.ok) {
          const body = await response.text().catch(() => "");
          logger.error(
            { status: response.status, url, body },
            "erro ao executar workflow n8n"
          );
          throw new Error(`n8n webhook falhou: ${response.status}`);
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
