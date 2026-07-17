import type { MockClaim, InternalClaim } from "@/data/mockData";
import { apiClient } from "./apiClient";
import {
  mockGetUserClaims,
  mockGetClaimById,
  mockSubmitClaim,
  mockGetInternalClaimsQueue,
} from "./mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

export type SubmitClaimInput = {
  policyId?: string;
  type?: string;
  amount?: number;
  description?: string;
};

interface ClaimOutBackend {
  id: string;
  claim_number: string;
  policy_id: string;
  user_id: string;
  incident_type: string;
  claim_amount: number;
  description?: string;
  status: string;
  fraud_score: string;
  ai_confidence?: number;
  ai_summary?: string;
  submitted_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function mapClaimOutToMockClaim(c: ClaimOutBackend): MockClaim {
  return {
    id: c.claim_number || c.id,
    policyId: c.policy_id,
    type: c.incident_type,
    amount: c.claim_amount,
    status: c.status,
    filedAt: c.submitted_at
      ? new Date(c.submitted_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Today",
    fraudScore: (c.fraud_score?.toLowerCase() as "low" | "medium" | "high") || "low",
    aiConfidence: c.ai_confidence ? Math.round(c.ai_confidence * 100) : 90,
    summary: c.ai_summary || c.description || "Claim submitted via customer portal.",
  };
}

function mapClaimOutToInternalClaim(c: ClaimOutBackend): InternalClaim {
  const scoreLevel = (c.fraud_score || "low").toLowerCase();
  const numericScore = scoreLevel === "high" ? 85 : scoreLevel === "medium" ? 55 : 15;
  const levelText = scoreLevel === "high" ? "High" : scoreLevel === "medium" ? "Medium" : "Low";

  return {
    id: c.claim_number || c.id,
    customer: "Policyholder",
    type: c.incident_type,
    amount: c.claim_amount,
    submitted: c.submitted_at
      ? new Date(c.submitted_at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Recently",
    fraudScore: numericScore,
    fraudLevel: levelText,
    status: capitalize(c.status),
    documents: ["Claim_Form.pdf", "Supporting_Doc.pdf"],
    aiAssessment: c.ai_summary || "Automated rule assessment completed.",
    flags:
      levelText === "High"
        ? ["Procedure cap outlier", "Senior reviewer approval required"]
        : ["Standard policy compliance verified"],
  };
}

export async function getUserClaims(): Promise<MockClaim[]> {
  if (USE_MOCK) return mockGetUserClaims();

  const claims = await apiClient<ClaimOutBackend[]>("claims/me");
  return claims.map(mapClaimOutToMockClaim);
}

export async function getClaimById(id: string): Promise<MockClaim | null> {
  if (USE_MOCK) return mockGetClaimById(id);

  try {
    const c = await apiClient<ClaimOutBackend>(`claims/${id}`);
    return mapClaimOutToMockClaim(c);
  } catch {
    return null;
  }
}

export async function submitClaim(data: SubmitClaimInput): Promise<MockClaim> {
  if (USE_MOCK) return mockSubmitClaim(data);

  // If policyId is missing, fetch first active policy to prevent missing required UUID
  let targetPolicyId = data.policyId;
  if (!targetPolicyId) {
    const userPolicies = await apiClient<Array<{ id: string }>>("policies/me");
    if (userPolicies.length > 0) {
      targetPolicyId = userPolicies[0].id;
    } else {
      throw new Error("Cannot submit claim: No active policy found for user.");
    }
  }

  const payload = {
    policy_id: targetPolicyId,
    incident_type: data.type || "General Incident",
    claim_amount: Number(data.amount) || 0,
    description: data.description || "Submitted via online portal",
  };

  const created = await apiClient<ClaimOutBackend>("claims", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return mapClaimOutToMockClaim(created);
}

export async function getInternalClaimsQueue(): Promise<InternalClaim[]> {
  if (USE_MOCK) return mockGetInternalClaimsQueue();

  const claims = await apiClient<ClaimOutBackend[]>("claims/queue");
  return claims.map(mapClaimOutToInternalClaim);
}
