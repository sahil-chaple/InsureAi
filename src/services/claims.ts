import { mockClaims, mockInternalClaims, type MockClaim } from "@/data/mockData";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export type SubmitClaimInput = {
  policyId?: string;
  type?: string;
  amount?: number;
  description?: string;
};

export async function getUserClaims(): Promise<MockClaim[]> {
  await sleep(800);
  return mockClaims;
}

export async function getClaimById(id: string): Promise<MockClaim | null> {
  await sleep(600);
  return mockClaims.find((c) => c.id === id) || null;
}

export async function submitClaim(data: SubmitClaimInput): Promise<MockClaim> {
  await sleep(1500);
  const newClaim: MockClaim = {
    id: `CLM-2024-00${Math.floor(100 + Math.random() * 900)}`,
    type: data.type ?? "General",
    amount: data.amount ?? 0,
    status: "under_review",
    dateFiled: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    fraudScore: "low",
    aiConfidence: 95,
    summary:
      "Claim submitted via customer portal. Initial AI assessment pending.",
    policyId: data.policyId,
  };
  return newClaim;
}

export async function getInternalClaimsQueue() {
  await sleep(800);
  return mockInternalClaims;
}
