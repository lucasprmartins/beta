import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { SignInForm, SignUpForm } from "@/features/auth";
import { sessionOptions } from "@/lib/auth";

type AuthMode = "sign-in" | "sign-up";

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionOptions);

    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("sign-in");

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-100">
      <div className="flex flex-col items-center gap-4">
        <img
          alt="Logo"
          className="h-16 w-16"
          height={64}
          src="/logo-1.svg"
          width={64}
        />
        {mode === "sign-in" ? (
          <SignInForm onSwitchForm={() => setMode("sign-up")} />
        ) : (
          <SignUpForm onSwitchForm={() => setMode("sign-in")} />
        )}
      </div>
    </div>
  );
}
