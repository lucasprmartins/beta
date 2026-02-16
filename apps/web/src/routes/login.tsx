import { CubeIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { SignInForm, SignUpForm } from "@/features/auth";
import { sessionOptions } from "@/lib/auth";

type AuthMode = "sign-in" | "sign-up";

export const Route = createFileRoute("/login")({
  validateSearch: (search): { reason?: string } => ({
    reason: (search as { reason?: string }).reason,
  }),
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionOptions);

    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const { reason } = Route.useSearch();
  const [mode, setMode] = useState<AuthMode>("sign-in");

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-100">
      <div className="flex flex-col items-center gap-4">
        {reason === "session-expired" && (
          <div className="alert alert-warning">
            <WarningCircleIcon className="h-5 w-5 shrink-0" />
            <span>Sua sessão expirou. Faça login novamente.</span>
          </div>
        )}
        <CubeIcon className="h-12 w-12 text-base-content" weight="bold" />
        {mode === "sign-in" ? (
          <SignInForm onSwitchForm={() => setMode("sign-up")} />
        ) : (
          <SignUpForm onSwitchForm={() => setMode("sign-in")} />
        )}
      </div>
    </div>
  );
}
