import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Sidebar } from "@/components/sidebar";
import { sessionOptions } from "@/lib/auth";

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
});
