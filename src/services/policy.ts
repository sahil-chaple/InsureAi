import { plans, type Plan } from "@/data/plans";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function listPlans(): Promise<Plan[]> {
  await sleep(300);
  return plans;
}

export async function getPlan(id: string): Promise<Plan | undefined> {
  await sleep(200);
  return plans.find((p) => p.id === id);
}

export async function issuePolicy(planId: string, holder: string) {
  await sleep(600);
  const p = plans.find((pl) => pl.id === planId)!;
  const now = new Date();
  const end = new Date(now); end.setFullYear(end.getFullYear() + 1);
  return {
    id: `INS-${now.getFullYear()}-${p.type.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    planId: p.id,
    planName: p.name,
    type: p.type,
    coverage: p.coverage,
    premium: p.premium,
    status: "Active" as const,
    validFrom: now.toISOString(),
    validTo: end.toISOString(),
    holder,
  };
}
