import type { Claim } from "@/store/claims";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fileClaim(input: Omit<Claim, "id" | "submittedAt" | "status">): Promise<Claim> {
  await sleep(800);
  return {
    ...input,
    id: `CLM-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    submittedAt: new Date().toISOString(),
    status: "In Review",
  };
}
