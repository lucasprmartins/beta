import { WarningCircle as WarningCircleIcon } from "@phosphor-icons/react";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ErrorComponentProps } from "@tanstack/react-router";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AuthProvider } from "../lib/auth";

interface RouterContext {
  queryClient: QueryClient;
}

function RootErrorComponent({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-100">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-box border border-error p-8 text-center">
        <WarningCircleIcon className="h-12 w-12 text-error" weight="bold" />
        <h1 className="font-bold text-2xl text-error">Algo deu errado</h1>
        <p className="text-sm opacity-70">
          Ocorreu um erro inesperado ao carregar a aplicação.
        </p>
        {import.meta.env.DEV && error.message && (
          <p className="text-xs opacity-40">{error.message}</p>
        )}
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={reset} type="button">
            Tentar novamente
          </button>
          <Link className="btn btn-outline" to="/">
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <AuthProvider
      redirects={{
        afterSignIn: "/dashboard",
        afterSignUp: "/dashboard",
        afterSignOut: "/",
      }}
    >
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </AuthProvider>
  ),
  errorComponent: RootErrorComponent,
});
