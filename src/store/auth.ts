import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "customer" | "claims_reviewer" | "underwriter" | "admin" | "auditor";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (u: AuthUser) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: "insureai-auth" },
  ),
);

export function roleHome(role: Role): string {
  switch (role) {
    case "claims_reviewer": return "/internal/claims";
    case "underwriter": return "/internal/underwriting";
    case "admin": return "/internal/admin";
    case "auditor": return "/internal/audit";
    default: return "/dashboard";
  }
}
