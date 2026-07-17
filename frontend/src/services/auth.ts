import { useAuthStore, type AuthUser, type Role } from "@/store/auth";
import { apiClient, setAccessToken } from "./apiClient";
import {
  mockSignup,
  mockLogin,
  mockDemoLogin,
  mockGetCurrentUser,
  mockLogout,
} from "./mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

export type LoginResult = {
  user: AuthUser;
  token: string;
};

const DEMO_EMAILS: Record<Role, string> = {
  customer: "customer@insureai.com",
  claims_reviewer: "reviewer@insureai.com",
  underwriter: "underwriter@insureai.com",
  admin: "admin@insureai.com",
  auditor: "auditor@insureai.com",
};

interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
}

interface UserOut {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  is_active: boolean;
}

function mapUserOutToAuthUser(u: UserOut): AuthUser {
  const initials = u.full_name
    ? u.full_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "US";

  return {
    id: u.id,
    name: u.full_name,
    email: u.email,
    phone: u.phone || undefined,
    avatarInitials: initials,
    role: u.role as Role,
  };
}

export async function signup(name: string, email: string, password = "password123"): Promise<LoginResult> {
  if (USE_MOCK) return mockSignup(name, email);

  const res = await apiClient<TokenResponse>("auth/signup", {
    method: "POST",
    body: JSON.stringify({
      full_name: name,
      email,
      password,
    }),
  });

  setAccessToken(res.access_token);
  const user = await getCurrentUser();
  return { user, token: res.access_token };
}

export async function login(email: string, password: string): Promise<LoginResult> {
  if (USE_MOCK) return mockLogin(email, password);

  const res = await apiClient<TokenResponse>("auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  setAccessToken(res.access_token);
  const user = await getCurrentUser();
  return { user, token: res.access_token };
}

export async function demoLogin(role: Role): Promise<LoginResult> {
  if (USE_MOCK) return mockDemoLogin(role);

  const email = DEMO_EMAILS[role] || "customer@insureai.com";
  return login(email, "password123");
}

export async function getCurrentUser(): Promise<AuthUser> {
  if (USE_MOCK) return mockGetCurrentUser();

  const userOut = await apiClient<UserOut>("auth/me");
  return mapUserOutToAuthUser(userOut);
}

export function logout(): void {
  if (USE_MOCK) {
    mockLogout();
    return;
  }
  apiClient("auth/logout", { method: "POST" }).catch(() => {});
  useAuthStore.getState().logout();
}
