import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useAuthStore } from "@/store/auth";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const s = useAuthStore.getState();
      if (!s.isAuthenticated) throw redirect({ to: "/login" });
    }
  },
});

function DashboardLayout() {
  return (
    <AppLayout variant="customer">
      <Outlet />
    </AppLayout>
  );
}
