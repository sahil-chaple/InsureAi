import { mockPolicies, mockRecommendations } from "@/data/mockData";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function getUserPolicies() {
  await sleep(800);
  return mockPolicies;
}

export async function getPolicyById(id: string) {
  await sleep(600);
  return mockPolicies.find((p) => p.id === id) || null;
}

export async function getRecommendations() {
  await sleep(1200);
  return mockRecommendations;
}

export async function getPlanById(id: string) {
  await sleep(600);
  return mockRecommendations.find((p) => p.id === id) || null;
}

export async function issuePolicy(planId: string, holderName: string) {
  await sleep(1000);
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
