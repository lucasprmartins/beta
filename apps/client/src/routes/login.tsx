import { createFileRoute, redirect } from "@tanstack/react-router";
import { sessionOptions } from "@/auth/config";
import { LoginPage } from "@/pages/LoginPage";

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
  component: () => {
    const { reason } = Route.useSearch();
    return <LoginPage reason={reason} />;
  },
});
