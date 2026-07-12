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
