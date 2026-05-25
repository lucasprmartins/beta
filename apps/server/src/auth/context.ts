import type { IncomingHttpHeaders } from "node:http";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "@/auth/index";

export async function createContext(headers: IncomingHttpHeaders) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(headers),
  });

  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
