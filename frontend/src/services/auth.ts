import { mockUser } from "@/data/mockData";
import { useAuthStore, type AuthUser, type Role } from "@/store/auth";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export type LoginResult = {
  user: AuthUser;
  token: string;
};

const DEMO_NAMES: Record<Role, string> = {
  customer: mockUser.name,
  claims_reviewer: "Priya Reviewer",
  underwriter: "Rahul Underwriter",
  admin: "Neha Admin",
  auditor: "Vikram Auditor",
};

function toAuthUser(role: Role, name?: string, email?: string): AuthUser {
  if (role === "customer") {
    return {
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      phone: mockUser.phone,
      avatarInitials: mockUser.avatarInitials,
      role: "customer",
    };
  }
  return {
    id: crypto.randomUUID(),
    name: name ?? DEMO_NAMES[role],
    email: email ?? `${role}@insureai.demo`,
    avatarInitials: (name ?? DEMO_NAMES[role]).split(" ").map((w) => w[0]).join("").slice(0, 2),
    role,
  };
}

export async function signup(name: string, email: string): Promise<LoginResult> {
  await sleep(1500);
  const user: AuthUser = { ...toAuthUser("customer"), name, email };
  const token = `mock-jwt-${crypto.randomUUID()}`;
  return { user, token };
}

export async function login(_email: string, _password: string): Promise<LoginResult> {
  await sleep(900);
  const user = toAuthUser("customer");
  const token = `mock-jwt-${crypto.randomUUID()}`;
  return { user, token };
}

export async function demoLogin(role: Role): Promise<LoginResult> {
  await sleep(400);
  const user = toAuthUser(role);
  const token = `mock-jwt-${crypto.randomUUID()}`;
  return { user, token };
}

export async function getCurrentUser(): Promise<AuthUser> {
  await sleep(300);
  return toAuthUser("customer");
}

export function logout(): void {
  useAuthStore.getState().logout();
}
