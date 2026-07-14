import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "customer" | "claims_reviewer" | "underwriter" | "admin" | "auditor";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarInitials?: string;
  role: Role;
};

type AuthState = {
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (u: AuthUser, token?: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isAuthenticated: false,
      token: null,
      login: (user, token) =>
        set({
          user,
          role: user.role,
          isAuthenticated: true,
          token: token ?? `mock-jwt-${user.id}`,
        }),
      logout: () => set({ user: null, role: null, isAuthenticated: false, token: null }),
    }),
    { name: "insureai-auth" },
  ),
);

export function roleHome(role: Role): string {
  switch (role) {
    case "claims_reviewer":
      return "/internal/claims";
    case "underwriter":
      return "/internal/underwriting";
    case "admin":
      return "/internal/admin";
    case "auditor":
      return "/internal/audit";
    default:
      return "/dashboard";
  }
}
