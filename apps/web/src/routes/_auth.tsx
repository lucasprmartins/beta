import { WarningCircle as WarningCircleIcon } from "@phosphor-icons/react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { Sidebar } from "@/components/sidebar";
import { sessionOptions } from "@/lib/auth";

function AuthErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <Sidebar>
      <div className="flex min-h-[calc(100vh-3.75rem)] items-center justify-center">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-box border border-error p-8 text-center">
          <WarningCircleIcon className="h-12 w-12 text-error" weight="bold" />
          <h1 className="font-bold text-2xl text-error">Algo deu errado</h1>
          <p className="text-sm opacity-70">
            Ocorreu um erro inesperado ao carregar esta página.
          </p>
          {import.meta.env.DEV && error.message && (
            <p className="text-xs opacity-40">{error.message}</p>
          )}
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={reset} type="button">
              Tentar novamente
            </button>
            <Link className="btn btn-outline" to="/dashboard">
              Ir para o início
            </Link>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionOptions);

    if (!session) {
      throw redirect({ to: "/login" });
    }

    return { session };
  },
  component: () => (
    <Sidebar>
      <Outlet />
    </Sidebar>
  ),
  errorComponent: AuthErrorComponent,
});
