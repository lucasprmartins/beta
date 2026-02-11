import type { Context } from "@app/auth/server";
import { ORPCError, os } from "@orpc/server";

export const o = os.$context<Context>();

export const publicRouter = o;

const requireAuth = o.middleware(({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Você não está autenticado.",
    });
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const authRouter = publicRouter.use(requireAuth);

const requireAdmin = o.middleware(({ context, next }) => {
  if (context.session?.user?.role !== "admin") {
    throw new ORPCError("FORBIDDEN", {
      message: "Você não tem permissão.",
    });
  }

  return next();
});

export const adminRouter = authRouter.use(requireAdmin);
