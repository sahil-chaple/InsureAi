import {
  mockUser,
  mockPolicies,
  mockClaims,
  mockRecommendations,
  mockInternalClaims,
  mockAuditLog,
  mockAgentActivity,
  mockChatHistory,
  type MockClaim,
  type MockPolicy,
  type RecommendationPlan,
  type InternalClaim,
  type AuditEntry,
  type AgentActivityEntry,
} from "@/data/mockData";
import { useAuthStore, type AuthUser, type Role } from "@/store/auth";
import type { RiskProfile, ChatResponse } from "./ai";
import type { SubmitClaimInput } from "./claims";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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

// ─── AUTH MOCKS ─────────────────────────────────────────────────────────────
export async function mockSignup(name: string, email: string) {
  await sleep(1000);
  const user: AuthUser = { ...toAuthUser("customer"), name, email };
  const token = `mock-jwt-${crypto.randomUUID()}`;
  return { user, token };
}

export async function mockLogin(_email: string, _password: string) {
  await sleep(800);
  const user = toAuthUser("customer");
  const token = `mock-jwt-${crypto.randomUUID()}`;
  return { user, token };
}

export async function mockDemoLogin(role: Role) {
  await sleep(400);
  const user = toAuthUser(role);
  const token = `mock-jwt-${crypto.randomUUID()}`;
  return { user, token };
}

export async function mockGetCurrentUser() {
  await sleep(300);
  return toAuthUser("customer");
}

export function mockLogout() {
  useAuthStore.getState().logout();
}

// ─── POLICY MOCKS ────────────────────────────────────────────────────────────
export async function mockGetUserPolicies(): Promise<MockPolicy[]> {
  await sleep(600);
  return mockPolicies;
}

export async function mockGetPolicyById(id: string): Promise<MockPolicy | null> {
  await sleep(400);
  return mockPolicies.find((p) => p.id === id) || null;
}

export async function mockGetRecommendations(): Promise<RecommendationPlan[]> {
  await sleep(800);
  return mockRecommendations;
}

export async function mockGetPlanById(id: string): Promise<RecommendationPlan | null> {
  await sleep(400);
  return mockRecommendations.find((p) => p.id === id) || null;
}

export async function mockIssuePolicy(planId: string, holderName: string) {
  await sleep(800);
  const plan = mockRecommendations.find((p) => p.id === planId);
  const validFrom = new Date().toISOString();
  const validTo = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
  return {
    id: `INS-2024-${plan?.type.slice(0, 2).toUpperCase() || "HL"}-00${Math.floor(100 + Math.random() * 900)}`,
    planId,
    planName: plan?.name || "Insurance Plan",
    type: plan?.type || "General",
    coverage: plan?.coverage || 500000,
    premium: plan?.premium || 10000,
    status: "Active" as const,
    validFrom,
    validTo,
    holder: holderName,
  };
}

// ─── CLAIMS MOCKS ────────────────────────────────────────────────────────────
export async function mockGetUserClaims(): Promise<MockClaim[]> {
  await sleep(600);
  return mockClaims;
}

export async function mockGetClaimById(id: string): Promise<MockClaim | null> {
  await sleep(400);
  return mockClaims.find((c) => c.id === id) || null;
}

export async function mockSubmitClaim(data: SubmitClaimInput): Promise<MockClaim> {
  await sleep(1000);
  const newClaim: MockClaim = {
    id: `CLM-2024-00${Math.floor(100 + Math.random() * 900)}`,
    type: data.type ?? "General",
    amount: data.amount ?? 0,
    status: "under_review",
    filedAt: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    fraudScore: "low",
    aiConfidence: 95,
    summary: "Claim submitted via customer portal. Initial AI assessment pending.",
    policyId: data.policyId || "",
  };
  return newClaim;
}

export async function mockGetInternalClaimsQueue(): Promise<InternalClaim[]> {
  await sleep(600);
  return mockInternalClaims;
}

// ─── AI MOCKS ────────────────────────────────────────────────────────────────
export async function mockGetChatResponse(message: string): Promise<ChatResponse> {
  await sleep(700);
  const lowerMsg = message.toLowerCase();

  const keywordMap: [string[], number][] = [
    [["hospitalization", "health policy", "cover"], 0],
    [["accident", "claim", "file a claim", "motor"], 1],
    [["premium", "due", "next", "renew"], 2],
  ];

  for (const [keywords, idx] of keywordMap) {
    if (keywords.some((kw) => lowerMsg.includes(kw))) {
      const qa = mockChatHistory[idx];
      return {
        text: qa.a,
        citations: qa.citations.map((c) => ({
          label: c.includes("INS-") ? "Policy No" : "Reference",
          doc: c,
        })),
        confidence: idx === 0 ? 96 : idx === 1 ? 92 : 95,
        flagged: false,
      };
    }
  }

  return {
    text: "I'm not sure I can answer that right now. Your query has been flagged for human review — a support agent will follow up shortly.",
    citations: [],
    confidence: 68,
    flagged: true,
  };
}

export async function mockGetClaimResponse(_desc: string) {
  await sleep(1000);
  return {
    approvalLikelihood: 87,
    summary: "Based on initial AI triage of the details provided, the claim shows standard eligibility alignment.",
    notes: [
      "Incident description matches covered events under your active policy.",
      "Required document format verified and verified by AI model.",
      "No anomalous claim frequency detected on this policy.",
    ],
  };
}

export async function mockAnalyzeUserProfile(_profileData: any): Promise<RiskProfile> {
  await sleep(1000);
  return {
    healthRisk: "Moderate",
    assetExposure: "High",
    lifeCoverNeed: "Critical",
    recommendedBudgetMin: 15000,
    recommendedBudgetMax: 35000,
  };
}

export async function mockGetAgentActivity(): Promise<AgentActivityEntry[]> {
  await sleep(500);
  return mockAgentActivity;
}

// ─── AUDIT MOCKS ─────────────────────────────────────────────────────────────
export async function mockGetAuditLog(): Promise<AuditEntry[]> {
  await sleep(600);
  return mockAuditLog;
}
