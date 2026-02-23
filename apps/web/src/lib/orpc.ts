import type { AppRouterClient } from "@app/api";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";

let redirecionando = false;

export const link = new RPCLink({
  url: import.meta.env.VITE_SERVER_URL
    ? `${import.meta.env.VITE_SERVER_URL}/rpc`
    : "/rpc",
  async fetch(input, options) {
    const response = await globalThis.fetch(input, {
      ...options,
      credentials: "include",
    });

    if (response.status === 401 && !redirecionando) {
      redirecionando = true;
      window.location.href = "/login?reason=session-expired";
    }

    return response;
  },
});

export const client: AppRouterClient = createORPCClient(link);
export const orpc = createTanstackQueryUtils(client);
