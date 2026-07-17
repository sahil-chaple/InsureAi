import type { AgentActivityEntry } from "@/data/mockData";
import { apiClient } from "./apiClient";
import {
  mockGetChatResponse,
  mockGetClaimResponse,
  mockAnalyzeUserProfile,
  mockGetAgentActivity,
} from "./mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

export type RiskProfile = {
  healthRisk: string;
  assetExposure: string;
  lifeCoverNeed: string;
  recommendedBudgetMin: number;
  recommendedBudgetMax: number;
};

export type ChatResponseCitation = {
  label: string;
  doc: string;
};

export type ChatResponse = {
  text: string;
  citations: ChatResponseCitation[];
  confidence: number;
  flagged: boolean;
};

interface RiskAnalysisBackend {
  healthRisk: string;
  assetExposure: string;
  lifeCoverNeed: string;
  profile: any;
}

interface AgentActivityOutBackend {
  id: string;
  timestamp: string;
  agent_name: string;
  action: string;
  target_entity: string;
  target_id: string;
  confidence: number;
  reasoning: string;
  status: string;
}

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export async function getChatResponse(message: string): Promise<ChatResponse> {
  return mockGetChatResponse(message);
}

export function getSeededChatHistory() {
  return [
    {
      role: "ai" as const,
      text: "Hi! I have access to your active policies and can answer questions about coverage, claims, or renewals. What would you like to know?",
      citations: [],
      confidence: 100,
    },
    {
      role: "user" as const,
      text: "What does my health policy cover for hospitalization?",
    },
    {
      role: "ai" as const,
      text: "Your Health policy covers room rent, ICU charges, daycare procedures, pre-hospitalization for 60 days, and post-hospitalization for 90 days with zero copay.",
      citations: [{ label: "Policy Document", doc: "Policy_HL-2024.pdf" }],
      confidence: 96,
    },
  ];
}

export async function getClaimResponse(desc: string) {
  return mockGetClaimResponse(desc);
}

export async function analyzeUserProfile(profileData: any): Promise<RiskProfile> {
  if (USE_MOCK) return mockAnalyzeUserProfile(profileData);

  const payload = {
    date_of_birth: profileData.dob || "1992-06-15",
    gender: profileData.gender || "male",
    marital_status: profileData.marital || "single",
    occupation: profileData.occupation || "Professional",
    annual_income: Number(profileData.income) || 75000,
    city: profileData.city || "Metropolis",
    state: profileData.state || "State",
    height_cm: Number(profileData.heightCm) || 175,
    weight_kg: Number(profileData.weightKg) || 70,
    is_smoker: Boolean(profileData.smoker),
    pre_existing_conditions: profileData.conditions || [],
    owns_vehicle: Boolean(profileData.ownsVehicle),
    owns_home: Boolean(profileData.ownsHome),
  };

  try {
    const res = await apiClient<RiskAnalysisBackend>("recommendations/analyze", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      healthRisk: capitalize(res.healthRisk),
      assetExposure: capitalize(res.assetExposure),
      lifeCoverNeed: capitalize(res.lifeCoverNeed),
      recommendedBudgetMin: 15000,
      recommendedBudgetMax: 35000,
    };
  } catch {
    return mockAnalyzeUserProfile(profileData);
  }
}

export async function getAgentActivity(): Promise<AgentActivityEntry[]> {
  if (USE_MOCK) return mockGetAgentActivity();

  try {
    const activities = await apiClient<AgentActivityOutBackend[]>("admin/agent-activity");
    return activities.map((a) => ({
      id: a.id,
      agentName: a.agent_name,
      action: a.action,
      confidence: Math.round(a.confidence * 100),
      humanOverride: false,
      timestamp: a.timestamp ? new Date(a.timestamp).toLocaleTimeString() : "Recent",
      inputSummary: `${a.action} on ${a.target_entity} (${a.target_id})`,
      outputSummary: a.reasoning,
    }));
  } catch {
    return mockGetAgentActivity();
  }
}
