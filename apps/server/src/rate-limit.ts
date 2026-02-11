import type { Generator } from "elysia-rate-limit";

export const RATE_LIMITS = {
  rpc: { duration: 60 * 1000, max: 120 },
  api: { duration: 60 * 1000, max: 60 },
} as const;

export const rateLimitGenerator: Generator = (request, server) => {
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  if (forwardedFor) {
    return forwardedFor;
  }

  return server?.requestIP(request)?.address ?? "unknown-client";
};
