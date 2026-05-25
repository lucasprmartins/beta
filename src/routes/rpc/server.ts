import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/node";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { logger } from "../../config/logger";
import { taskRouter } from "./routers/task";

export const router = { task: taskRouter };

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
      docsPath: "/reference",
      docsProvider: "scalar",
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "API",
          version: "1.0.0",
          description: "API REST gerada a partir dos handlers do oRPC.",
        },
      },
    }),
  ],
  interceptors: [
    onError((error) =>
      logger.error({ err: error, handler: "api" }, "erro no handler")
    ),
  ],
});
