import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ErrorComponentProps } from "@tanstack/react-router";
import {
  createRootRouteWithContext,
  ErrorComponent,
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
      <div className="flex max-w-md flex-col gap-4 rounded-box border border-error p-6 text-center">
        <h1 className="font-bold text-2xl text-error">Algo deu errado</h1>
        <p className="text-sm opacity-70">
          Ocorreu um erro inesperado ao carregar a aplicação.
        </p>
        <ErrorComponent error={error} />
        <button className="btn btn-primary" onClick={reset} type="button">
          Tentar novamente
        </button>
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
