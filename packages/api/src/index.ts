import { logger } from "@app/infra/logger";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import type { RouterClient } from "@orpc/server";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { categoriaRouter } from "./routers/example-crud";
import { produtoRouter } from "./routers/example-domain";

export const router = {
  categoria: categoriaRouter,
  produto: produtoRouter,
};

export type AppRouterClient = RouterClient<typeof router>;

export const rpcHandler = new RPCHandler(router, {
  interceptors: [
    onError((error) =>
      logger.error({ err: error, handler: "rpc" }, "erro no handler")
    ),
  ],
});

export const apiHandler = new OpenAPIHandler(router, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) =>
      logger.error({ err: error, handler: "api" }, "erro no handler")
    ),
  ],
});
