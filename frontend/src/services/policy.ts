import type { MockPolicy, PolicyStatus, RecommendationPlan } from "@/data/mockData";
import { apiClient } from "./apiClient";
import {
  mockGetUserPolicies,
  mockGetPolicyById,
  mockGetRecommendations,
  mockGetPlanById,
  mockIssuePolicy,
} from "./mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

interface PolicyOutBackend {
  id: string;
  policy_number: string;
  user_id: string;
  policy_type: string;
  provider_name: str;
  coverage_amount: number;
  premium_amount: number;
  status: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

interface PlanRecommendationBackend {
  id: string;
  name: string;
  policy_type: string;
  provider_name: string;
  coverage_amount: number;
  premium_amount: number;
  description?: string;
  features?: string[];
  match_score: number;
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function mapPolicyOutToMockPolicy(p: PolicyOutBackend): MockPolicy {
  return {
    id: p.id,
    policyNumber: p.policy_number,
    planName: `${p.provider_name} ${capitalize(p.policy_type)}`,
    provider: p.provider_name,
    type: capitalize(p.policy_type),
    coverage: p.coverage_amount,
    premium: p.premium_amount,
    status: (p.status.toLowerCase() as PolicyStatus) || "active",
    renewsOn: p.end_date,
    validFrom: p.start_date,
    coverageBreakdown: [
      `In-patient & Specialist Care: 100% up to sum insured (${p.coverage_amount})`,
      "Emergency Ambulance & Daycare treatment included",
      "No Claim Bonus protection eligible per active policy year",
    ],
    documents: [
      { name: `Policy_${p.policy_number}.pdf`, size: "1.8 MB" },
    ],
    nominee: {
      name: "Declared Nominee",
      relation: "Primary Dependent",
      phone: "+1 (555) 019-2834",
    },
  };
}

function mapPlanRecToRecommendationPlan(p: PlanRecommendationBackend, index: number): RecommendationPlan {
  return {
    id: p.id,
    name: p.name,
    provider: p.provider_name,
    type: capitalize(p.policy_type),
    coverage: p.coverage_amount,
    premium: p.premium_amount,
    matchScore: p.match_score,
    tier: p.match_score >= 80 ? "Premium" : "Standard",
    isRecommended: index === 0 || p.match_score >= 85,
    features: p.features && p.features.length ? p.features : ["Zero Deductible", "Global Coverage", "24/7 AI Concierge"],
    deductible: 0,
    term: "1 year",
    covered: ["Hospitalisation", "Day-care procedures", "Mental health", "Emergency Ambulance"],
    excluded: ["Cosmetic surgery", "Unapproved experimental treatments"],
    settlement: "Cashless / Fast Reimbursement",
    avgClaimDays: 2,
    addOns: ["Critical Illness Rider", "Accidental Death Booster"],
    aiInsight: p.description || "Optimal risk-to-premium coverage ratio for your age and profile.",
  };
}

export async function getUserPolicies(): Promise<MockPolicy[]> {
  if (USE_MOCK) return mockGetUserPolicies();

  const policies = await apiClient<PolicyOutBackend[]>("policies/me");
  return policies.map(mapPolicyOutToMockPolicy);
}

export async function getPolicyById(id: string): Promise<MockPolicy | null> {
  if (USE_MOCK) return mockGetPolicyById(id);

  try {
    const p = await apiClient<PolicyOutBackend>(`policies/${id}`);
    return mapPolicyOutToMockPolicy(p);
  } catch {
    return null;
  }
}

export async function getRecommendations(): Promise<RecommendationPlan[]> {
  if (USE_MOCK) return mockGetRecommendations();

  const plans = await apiClient<PlanRecommendationBackend[]>("recommendations");
  return plans.map((p, idx) => mapPlanRecToRecommendationPlan(p, idx));
}

export async function getPlanById(id: string): Promise<RecommendationPlan | null> {
  if (USE_MOCK) return mockGetPlanById(id);

  const plans = await getRecommendations();
  return plans.find((p) => p.id === id) || null;
}

export async function issuePolicy(planId: string, holderName: string) {
  if (USE_MOCK) return mockIssuePolicy(planId, holderName);

  const plans = await getRecommendations();
  const plan = plans.find((p) => p.id === planId);

  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);

  const payload = {
    policy_type: (plan?.type || "health").toLowerCase(),
    provider_name: plan?.provider || "InsureAI Health",
    coverage_amount: plan?.coverage || 500000,
    premium_amount: plan?.premium || 10000,
    start_date: now.toISOString().split("T")[0],
    end_date: nextYear.toISOString().split("T")[0],
  };

  const created = await apiClient<PolicyOutBackend>("policies", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    id: created.id,
    planId,
    planName: created.provider_name + " " + capitalize(created.policy_type),
    type: capitalize(created.policy_type),
    coverage: created.coverage_amount,
    premium: created.premium_amount,
    status: "Active" as const,
    validFrom: created.start_date,
    validTo: created.end_date,
    holder: holderName,
  };
}
