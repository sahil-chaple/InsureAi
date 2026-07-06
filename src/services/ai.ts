import type { OnboardingData } from "@/store/onboarding";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type RiskProfile = {
  healthRisk: "Low" | "Medium" | "High";
  assetExposure: "Low" | "Medium" | "High";
  lifeCoverNeed: "Low" | "Medium" | "High";
  premiumBudget: string;
};

export function computeRisk(d: OnboardingData): RiskProfile {
  const smokerBoost = d.smoker ? 1 : 0;
  const cond = (d.conditions || []).filter((c) => c !== "None").length;
  const healthScore = smokerBoost + cond;
  return {
    healthRisk: healthScore >= 2 ? "High" : healthScore === 1 ? "Medium" : "Low",
    assetExposure: d.ownsVehicle || d.ownsHome ? "Medium" : "Low",
    lifeCoverNeed: d.marital === "Married" ? "High" : "Medium",
    premiumBudget: "₹8,000 — ₹12,000 / yr",
  };
}

export async function askAssistant(message: string): Promise<string> {
  await sleep(900);
  const canned = [
    "Based on your active health policy, you're covered for hospitalisation up to ₹10L with cashless treatment at 8,000+ network hospitals.",
    "You can file a claim from Dashboard → File a Claim. Most claims are pre-assessed by our AI in under 60 seconds.",
    "Your next premium is due on the renewal date shown in your policy card. You can pay it via any UPI or card.",
    "For your profile, I'd suggest reviewing the top-up add-on — it doubles your coverage for a small premium increase.",
  ];
  const lower = message.toLowerCase();
  if (lower.includes("claim")) return canned[1];
  if (lower.includes("premium") || lower.includes("pay")) return canned[2];
  if (lower.includes("coverage") || lower.includes("cover")) return canned[0];
  return canned[3];
}

export async function assessClaim(_desc: string): Promise<{ approvalLikelihood: number; notes: string[] }> {
  await sleep(1200);
  return {
    approvalLikelihood: 87,
    notes: [
      "Incident type matches covered events under your policy.",
      "Documents uploaded appear authentic and complete.",
      "No prior claim history flags on this policy.",
    ],
  };
}
