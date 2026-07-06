import type { AuthUser, Role } from "@/store/auth";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function signup(name: string, email: string): Promise<AuthUser> {
  await sleep(1500);
  return { id: crypto.randomUUID(), name, email, role: "customer" };
}

export async function login(email: string): Promise<AuthUser> {
  await sleep(1200);
  return { id: crypto.randomUUID(), name: email.split("@")[0] || "User", email, role: "customer" };
}

export async function demoLogin(role: Role): Promise<AuthUser> {
  await sleep(400);
  const names: Record<Role, string> = {
    customer: "Arjun Mehta",
    claims_reviewer: "Priya Reviewer",
    underwriter: "Rahul Underwriter",
    admin: "Neha Admin",
    auditor: "Vikram Auditor",
  };
  return { id: crypto.randomUUID(), name: names[role], email: `${role}@insureai.demo`, role };
}
