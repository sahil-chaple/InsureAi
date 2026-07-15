import { mockAgentActivity, mockChatHistory } from "@/data/mockData";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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

export async function getChatResponse(message: string): Promise<ChatResponse> {
  await sleep(900);
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

export function getSeededChatHistory() {
  return [
    {
      role: "ai" as const,
      text: "Hi Arjun! I have access to your active policies and can answer questions about coverage, claims, or renewals. What would you like to know?",
      citations: [],
      confidence: 100,
    },
    {
      role: "user" as const,
      text: "What does my health policy cover for hospitalization?",
    },
    {
      role: "ai" as const,
      text: "Your Star Comprehensive Health policy (INS-2024-HL-00487) covers room rent up to 1% of the sum insured (₹5,000/day) and ICU charges up to 2%. It also covers pre-hospitalization for 60 days and post-hospitalization for 90 days. Day care treatments and annual health checkups are fully covered.",
      citations: [{ label: "Policy Document", doc: "Policy_HL-2024.pdf" }],
      confidence: 96,
    },
  ];
}

export async function getClaimResponse(desc: string): Promise<{ approvalLikelihood: number; notes: string[]; summary: string }> {
  await sleep(1500);
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

export async function analyzeUserProfile(_profileData: any): Promise<RiskProfile> {
  await sleep(6000);
  return {
    healthRisk: "Moderate",
    assetExposure: "High",
    lifeCoverNeed: "Critical",
    recommendedBudgetMin: 15000,
    recommendedBudgetMax: 35000,
  };
}

export async function getAgentActivity() {
  await sleep(600);
  return mockAgentActivity;
}
