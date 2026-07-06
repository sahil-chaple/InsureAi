import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAuthStore } from "@/store/auth";

export const Route = createFileRoute("/internal")({
  component: InternalLayout,
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const s = useAuthStore.getState();
      if (!s.isAuthenticated) throw redirect({ to: "/login" });
    }
  },
});

function InternalLayout() {
  return (
    <AppLayout variant="internal">
      <Outlet />
    </AppLayout>
  );
}
