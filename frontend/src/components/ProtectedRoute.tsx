import { redirect } from "@tanstack/react-router";
import { useAuthStore, type Role, roleHome } from "@/store/auth";

/**
 * TanStack Router `beforeLoad` guard.
 * Usage:  beforeLoad: requireAuth(["customer"])
 */
export function requireAuth(allowedRoles: Role[]) {
  return () => {
    const { isAuthenticated, role } = useAuthStore.getState();

    if (!isAuthenticated) {
      throw redirect({ to: "/login" });
    }

    if (role && !allowedRoles.includes(role)) {
      throw redirect({ to: roleHome(role) });
    }
  };
}
