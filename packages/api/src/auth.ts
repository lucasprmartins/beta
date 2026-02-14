import type { Context } from "@app/auth/server";
import { ORPCError, os } from "@orpc/server";

export const o = os.$context<Context>();

export const requireAuth = o.middleware(({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Você não está autenticado.",
    });
  }
  return next({ context: { session: context.session } });
});

export function requireRole(...roles: string[]) {
  return o.middleware(({ context, next }) => {
    if (!context.session?.user) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Você não está autenticado.",
      });
    }
    if (!roles.includes(context.session.user.role ?? "")) {
      throw new ORPCError("FORBIDDEN", {
        message: "Você não tem permissão.",
      });
    }
    return next({ context: { session: context.session } });
  });
}
