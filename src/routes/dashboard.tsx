import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { requireAuth } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  beforeLoad: requireAuth(["customer"]),
});

function DashboardLayout() {
  return (
    <AppLayout variant="customer">
      <Outlet />
    </AppLayout>
  );
}
