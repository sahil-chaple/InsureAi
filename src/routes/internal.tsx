import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { requireAuth } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/internal")({
  component: InternalLayout,
  beforeLoad: requireAuth(["claims_reviewer", "underwriter", "admin", "auditor"]),
});

function InternalLayout() {
  return (
    <AppLayout variant="internal">
      <Outlet />
    </AppLayout>
  );
}
