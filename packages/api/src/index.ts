import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import type { RouterClient } from "@orpc/server";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { pokemonRouter } from "./routers/example";

export const router = {
  pokemon: pokemonRouter,
};

export type AppRouterClient = RouterClient<typeof router>;

export type ErrorHandler = (error: unknown) => void;

export function createRPCHandler(onErrorHandler: ErrorHandler) {
  return new RPCHandler(router, {
    interceptors: [onError((error) => onErrorHandler(error))],
  });
}

export function createAPIHandler(onErrorHandler: ErrorHandler) {
  return new OpenAPIHandler(router, {
    plugins: [
      new OpenAPIReferencePlugin({
        schemaConverters: [new ZodToJsonSchemaConverter()],
      }),
    ],
    interceptors: [onError((error) => onErrorHandler(error))],
  });
}
