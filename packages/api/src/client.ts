import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { router } from "./server";

export type AppRouterClient = RouterClient<typeof router>;

export function createClient(options?: { onUnauthorized?: () => void }) {
  const link = new RPCLink({
    url: import.meta.env.VITE_SERVER_URL
      ? `${import.meta.env.VITE_SERVER_URL}/rpc`
      : "/rpc",
    async fetch(input, init) {
      const response = await globalThis.fetch(input, {
        ...init,
        credentials: "include",
      });

      if (response.status === 401) {
        options?.onUnauthorized?.();
      }

      return response;
    },
  });

  const client: AppRouterClient = createORPCClient(link);
  const api = createTanstackQueryUtils(client);

  return { link, client, api };
}
