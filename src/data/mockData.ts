// ─── Types ───────────────────────────────────────────────────────────────────
export type PolicyStatus = "active" | "expiring_soon" | "expired";

export type MockPolicy = {
  id: string;
  policyNumber: string;
  planName: string;
  provider: string;
  type: string;
  coverage: number;
  premium: number;
  renewsOn: string;
  validFrom: string;
  status: PolicyStatus;
  coverageBreakdown: string[];
  documents: { name: string; size: string }[];
  nominee: { name: string; relation: string; phone: string };
};

export type MockClaim = {
  id: string;
  policyId: string;
  type: string;
  amount: number;
  status: string;
  filedAt: string;
  fraudScore: "low" | "medium" | "high";
  aiConfidence?: number;
  summary?: string;
  payout?: number;
  clearedBy?: string;
  reason?: string;
};

export type RecommendationPlan = {
  id: string;
  name: string;
  provider: string;
  type: string;
  coverage: number;
  premium: number;
  matchScore: number;
  tier: string;
  isRecommended: boolean;
  features: string[];
  deductible: number;
  term: string;
  covered: string[];
  excluded: string[];
  settlement: string;
  avgClaimDays: number;
  addOns: string[];
  aiInsight: string;
};

export type InternalClaim = {
  id: string;
  customer: string;
  type: string;
  amount: number;
  submitted: string;
  fraudScore: number;
  fraudLevel: "Low" | "Medium" | "High";
  status: string;
  documents: string[];
  aiAssessment: string;
  flags: string[];
};

export type AuditEntry = {
  eventId: string;
  timestamp: string;
  actor: string;
  eventType: string;
  entity: string;
  ip: string;
  result: string;
};

export type AgentActivityEntry = {
  id: string;
  agentName: string;
  action: string;
  confidence: number;
  humanOverride: boolean;
  timestamp: string;
  inputSummary: string;
  outputSummary: string;
};

export type ChatQA = {
  q: string;
  a: string;
  citations: string[];
};

export type Application = {
  id: string;
  customer: string;
  type: string;
  coverage: number;
  riskScore: number;
  factors: string[];
  recommended: string;
};

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const mockUser = {
  id: "user-arjun-001",
  name: "Arjun Sharma",
  email: "arjun.sharma@example.com",
  phone: "+91 98765 43210",
  avatarInitials: "AS",
  role: "customer" as const,
};

export const mockPolicies: MockPolicy[] = [
  {
    id: "INS-2024-HL-00487",
    policyNumber: "INS-2024-HL-00487",
    planName: "Star Comprehensive Health",
    provider: "Star Health",
    type: "Health",
    coverage: 500000,
    premium: 9800,
    status: "active",
    renewsOn: "15 Jan 2025",
    validFrom: "15 Jan 2024",
    coverageBreakdown: [
      "In-patient Hospitalisation: Capped at 1% of Sum Insured for room rent",
      "ICU Charges: Capped at 2% of Sum Insured",
      "Pre & Post Hospitalisation: 60/90 days covered",
      "Day Care Procedures: 140+ procedures covered",
      "No Claim Bonus: 10% increase in coverage per claim-free year",
    ],
    documents: [
      { name: "Policy_HL-2024.pdf" },
      { name: "Premium_Receipt_HL_2024.pdf" },
    ],
    nominee: {
      name: "Pooja Sharma",
      relation: "Spouse",
      phone: "+91 98765 43211",
    },
  },
  {
    id: "INS-2024-MT-00312",
    policyNumber: "INS-2024-MT-00312",
    planName: "HDFC ERGO Private Car Package",
    provider: "HDFC ERGO",
    type: "Motor",
    coverage: 800000,
    premium: 12400,
    status: "active",
    renewsOn: "1 Mar 2025",
    validFrom: "1 Mar 2024",
    coverageBreakdown: [
      "Own Damage: Covered up to Insured's Declared Value (IDV) of ₹8,00,000",
      "Third Party Liability: Unlimited personal injury, property damage up to ₹7.5L",
      "Zero Depreciation Add-on: 100% reimbursement for parts replacement",
      "Engine Protection: Coverage against hydrostatic lock and leakage",
    ],
    documents: [
      { name: "Policy_MT-2024.pdf" },
      { name: "Car_Registration_Copy.pdf" },
    ],
    nominee: {
      name: "Pooja Sharma",
      relation: "Spouse",
      phone: "+91 98765 43211",
    },
  },
  {
    id: "INS-2024-LF-00089",
    policyNumber: "INS-2024-LF-00089",
    planName: "LIC Tech-Term Plan",
    provider: "LIC",
    type: "Life",
    coverage: 5000000,
    premium: 24000,
    status: "expiring_soon",
    renewsOn: "31 Dec 2024",
    validFrom: "31 Dec 2014",
    coverageBreakdown: [
      "Death Benefit: ₹50,00,000 paid to nominee in case of death",
      "Terminal Illness Benefit: Acceleration of death benefit upon diagnosis",
      "Accidental Death Benefit Rider: Additional ₹20,00,000 payout",
    ],
    documents: [
      { name: "Policy_LF-2024.pdf" },
      { name: "Medical_Report_2014.pdf" },
    ],
    nominee: {
      name: "Pooja Sharma",
      relation: "Spouse",
      phone: "+91 98765 43211",
    },
  },
];

export const mockClaims: MockClaim[] = [
  {
    id: "CLM-2024-00891",
    policyId: "INS-2024-HL-00487",
    type: "Medical",
    amount: 45000,
    status: "under_review",
    filedAt: "10 Dec 2024",
    fraudScore: "low",
    aiConfidence: 91,
    summary:
      "Claim aligns with policy. Documents verified. Recommended for approval.",
  },
  {
    id: "CLM-2024-00654",
    policyId: "INS-2024-MT-00312",
    type: "Motor accident",
    amount: 85000,
    status: "approved",
    filedAt: "22 Nov 2024",
    fraudScore: "medium",
    payout: 78000,
    clearedBy: "agent",
  },
  {
    id: "CLM-2024-00203",
    policyId: "INS-2024-HL-00487",
    type: "Health",
    amount: 120000,
    status: "rejected",
    filedAt: "5 Sep 2024",
    fraudScore: "high",
    reason:
      "Claim filed 4 days after policy inception. Duplicate incident pattern detected.",
  },
];

export const mockRecommendations: RecommendationPlan[] = [
  {
    id: "plan-1",
    name: "Star Comprehensive Health",
    type: "Health",
    coverage: 500000,
    premium: 9800,
    matchScore: 96,
    tier: "Premium",
    isRecommended: true,
    features: [
      "Room rent waiver",
      "Day care treatments",
      "No claim bonus",
      "Annual health checkup",
      "Global cover",
    ],
    deductible: 0,
    term: "1 year",
    covered: ["Hospitalisation", "Day-care procedures", "AYUSH treatment", "Mental health", "Maternity (after 2y)"],
    excluded: ["Cosmetic surgery", "Self-inflicted injuries"],
    settlement: "Cashless / Reimbursement",
    avgClaimDays: 2,
    addOns: ["Critical illness", "OPD cover", "Personal accident"],
    aiInsight: "Best match for your health profile — no room-rent cap and full restore benefit suit families.",
  },
  {
    id: "plan-2",
    name: "Care Health Plus",
    type: "Health",
    coverage: 300000,
    premium: 6200,
    matchScore: 88,
    tier: "Standard",
    isRecommended: false,
    features: ["Room rent waiver", "Day care treatments", "No claim bonus"],
    deductible: 10000,
    term: "1 year",
    covered: ["Hospitalisation", "Day-care", "Ambulance"],
    excluded: ["AYUSH", "Mental health"],
    settlement: "Cashless / Reimbursement",
    avgClaimDays: 4,
    addOns: ["Critical illness", "Top-up"],
    aiInsight: "Solid value plan — trade-off is a room rent cap and slightly lower coverage.",
  },
  {
    id: "plan-3",
    name: "HDFC ERGO Optima Secure",
    type: "Health",
    coverage: 1000000,
    premium: 18500,
    matchScore: 82,
    tier: "Elite",
    isRecommended: false,
    features: [
      "Room rent waiver",
      "Day care treatments",
      "No claim bonus",
      "Annual health checkup",
      "Global cover",
      "Maternity cover",
    ],
    deductible: 0,
    term: "1 year",
    covered: ["Hospitalisation", "Day-care procedures", "AYUSH treatment", "Mental health", "Maternity (immediate)"],
    excluded: ["Cosmetic surgery"],
    settlement: "Cashless / Reimbursement",
    avgClaimDays: 1,
    addOns: ["Critical illness", "OPD cover", "Maternity rider"],
    aiInsight: "Maximum coverage options, but at a premium price point.",
  },
  {
    id: "plan-4",
    name: "Bajaj Allianz Motor OD",
    type: "Motor",
    coverage: 800000,
    premium: 12400,
    matchScore: 79,
    tier: "Standard",
    isRecommended: false,
    features: ["Zero depreciation", "Engine protection", "Consumables cover"],
    deductible: 2000,
    term: "1 year",
    covered: ["Third party liability", "Own damage", "Theft", "Natural disasters"],
    excluded: ["Wear & tear", "Racing"],
    settlement: "Cashless garages",
    avgClaimDays: 3,
    addOns: ["Key replacement", "NCB protect"],
    aiInsight: "Excellent motor own damage cover suitable for vehicles less than 5 years old.",
  },
];

export const mockInternalClaims: InternalClaim[] = [
  {
    id: "CLM-2024-00891",
    customer: "Priya Mehta",
    type: "Health",
    amount: 45000,
    submitted: "2 hours ago",
    fraudScore: 12,
    fraudLevel: "Low",
    status: "In Review",
    documents: ["Hospital_Bill.pdf", "Discharge_Summary.pdf", "Prescriptions.pdf"],
    aiAssessment: "Claim aligns with policy coverage limits. Pre-authorisation matched the final billing details. Recommended for direct approval.",
    flags: [
      "Standard hospital, network partner",
      "Diagnosis matches policy coverage",
      "No prior claims in the last 12 months",
    ],
  },
  {
    id: "CLM-2024-00654",
    customer: "Rohit Verma",
    type: "Motor",
    amount: 120000,
    submitted: "5 hours ago",
    fraudScore: 82,
    fraudLevel: "High",
    status: "In Review",
    documents: ["Accident_Photos.jpg", "FIR_Report.pdf", "Repair_Estimate.pdf"],
    aiAssessment: "High fraud risk flagged. Policy purchased 4 days prior to the accident timestamp. Repair estimation is 42% above segment average for this vehicle class.",
    flags: [
      "Claim filed 4 days after policy inception (unusual timing)",
      "Repair estimate 42% above market benchmarks",
      "Repair workshop not part of trusted garage network",
    ],
  },
  {
    id: "CLM-2024-00203",
    customer: "Sneha Iyer",
    type: "Life",
    amount: 20000,
    submitted: "1 day ago",
    fraudScore: 48,
    fraudLevel: "Medium",
    status: "Approved",
    documents: ["Claim_Form.pdf", "Death_Certificate.pdf", "KYC_Documents.pdf"],
    aiAssessment: "Standard claim validation passed. Minor discrepancy in nominee name spelling vs policy record, but signature matches validation.",
    flags: [
      "Nominee name spelling mismatch (minor)",
      "Standard claim documents verified",
      "Verification check cleared by auditor",
    ],
  },
  {
    id: "CLM-2024-00101",
    customer: "Vikram Nair",
    type: "Health",
    amount: 200000,
    submitted: "2 days ago",
    fraudScore: 28,
    fraudLevel: "Low",
    status: "In Review",
    documents: ["Billing_Invoice.pdf", "Lab_Reports.pdf"],
    aiAssessment: "Undergoing standard automated check. High claim amount but aligns with major surgery policy limits.",
    flags: [
      "Hospital billing matching standard medical code pricing",
      "No anomalies found in lab report dates",
    ],
  },
  {
    id: "CLM-2024-00999",
    customer: "Ananya Das",
    type: "Motor",
    amount: 50000,
    submitted: "3 days ago",
    fraudScore: 54,
    fraudLevel: "Medium",
    status: "In Review",
    documents: ["Garage_Bill.pdf", "Vehicle_Inspection.jpg"],
    aiAssessment: "Moderate risk level. Inspection photos match damage description, but billing items show double entry for bumper repair.",
    flags: [
      "Potential duplicate billing entries detected",
      "Damage location matches accident statement",
    ],
  },
];

export const mockAuditLog: AuditEntry[] = [
  {
    eventId: "EVT-000199",
    timestamp: "2024-11-01 14:30:00",
    actor: "System",
    eventType: "policy.issued",
    entity: "INS-2024-HL-00487",
    ip: "internal",
    result: "Success",
  },
  {
    eventId: "EVT-000198",
    timestamp: "2024-11-01 14:22:03",
    actor: "Arjun Sharma",
    eventType: "claim.submitted",
    entity: "CLM-2024-00891",
    ip: "203.0.113.14",
    result: "Success",
  },
  {
    eventId: "EVT-000197",
    timestamp: "2024-11-01 14:15:47",
    actor: "AI Agent",
    eventType: "document.verified",
    entity: "AADHAAR-XXXX-4521",
    ip: "internal",
    result: "Verified",
  },
  {
    eventId: "EVT-000196",
    timestamp: "2024-11-01 13:58:11",
    actor: "AI Agent",
    eventType: "fraud.score_computed",
    entity: "CLM-2024-00891",
    ip: "internal",
    result: "Score=Low",
  },
  {
    eventId: "EVT-000195",
    timestamp: "2024-11-01 13:44:20",
    actor: "Priya Mehta",
    eventType: "claim.approved",
    entity: "CLM-2024-00654",
    ip: "10.24.1.44",
    result: "Success",
  },
  {
    eventId: "EVT-000194",
    timestamp: "2024-11-01 13:22:08",
    actor: "Rohit Verma",
    eventType: "claim.rejected",
    entity: "CLM-2024-00203",
    ip: "10.24.1.51",
    result: "Rejected",
  },
  {
    eventId: "EVT-000193",
    timestamp: "2024-11-01 12:10:05",
    actor: "Arjun Sharma",
    eventType: "login",
    entity: "Session",
    ip: "203.0.113.14",
    result: "Success",
  },
  {
    eventId: "EVT-000192",
    timestamp: "2024-11-01 11:45:00",
    actor: "Admin",
    eventType: "admin.override",
    entity: "CLM-2024-00654",
    ip: "10.24.1.1",
    result: "Success",
  },
  {
    eventId: "EVT-000191",
    timestamp: "2024-11-01 10:30:15",
    actor: "System",
    eventType: "payment.processed",
    entity: "INS-2024-MT-00312",
    ip: "internal",
    result: "Success",
  },
  {
    eventId: "EVT-000190",
    timestamp: "2024-11-01 09:15:22",
    actor: "System",
    eventType: "otp.verified",
    entity: "Arjun Sharma",
    ip: "internal",
    result: "Verified",
  },
];

export const mockAgentActivity: AgentActivityEntry[] = [
  {
    id: "ACT-1",
    agentName: "Customer Assistant",
    action: "Responded to query",
    confidence: 92,
    humanOverride: false,
    timestamp: "1 min ago",
    inputSummary: "What does my health policy cover...",
    outputSummary: "Your health policy covers room rent...",
  },
  {
    id: "ACT-2",
    agentName: "Document Verification",
    action: "Verified KYC",
    confidence: 96,
    humanOverride: false,
    timestamp: "4 mins ago",
    inputSummary: "Uploaded Aadhar card for verification...",
    outputSummary: "Document authenticated successfully...",
  },
  {
    id: "ACT-3",
    agentName: "Policy Recommendation",
    action: "Generated plan list",
    confidence: 88,
    humanOverride: false,
    timestamp: "8 mins ago",
    inputSummary: "User profile: 32yo, needs health & motor...",
    outputSummary: "Recommended: Star Comprehensive...",
  },
  {
    id: "ACT-4",
    agentName: "Claims Assessment",
    action: "Initial review",
    confidence: 91,
    humanOverride: false,
    timestamp: "12 mins ago",
    inputSummary: "Medical bill for ₹45,000...",
    outputSummary: "Claim aligns with policy...",
  },
  {
    id: "ACT-5",
    agentName: "Fraud Detection",
    action: "Scored claim",
    confidence: 85,
    humanOverride: false,
    timestamp: "15 mins ago",
    inputSummary: "Claim CLM-2024-00203 submitted 4 days after...",
    outputSummary: "High fraud risk. Duplicate incident pattern...",
  },
  {
    id: "ACT-6",
    agentName: "Customer Assistant",
    action: "Flagged query",
    confidence: 78,
    humanOverride: true,
    timestamp: "20 mins ago",
    inputSummary: "How to bypass claim rejection...",
    outputSummary: "I cannot help with that. Flagged for review.",
  },
];

export const mockChatHistory: ChatQA[] = [
  {
    q: "What does my health policy cover for hospitalization?",
    a: "Your Star Comprehensive Health policy (INS-2024-HL-00487) covers room rent up to 1% of the sum insured (₹5,000/day) and ICU charges up to 2%. It also covers pre-hospitalization for 60 days and post-hospitalization for 90 days. Day care treatments and annual health checkups are fully covered.",
    citations: ["Policy_HL-2024.pdf"],
  },
  {
    q: "How do I file a claim for an accident?",
    a: "To file a motor accident claim: 1. Ensure safety and take photos of the damage. 2. File an FIR if a third party is involved. 3. Go to the 'New Claim' section in your dashboard. 4. Select your Motor policy (INS-2024-MT-00312). 5. Upload the photos, FIR (if any), and repair estimates. Our AI will assess the damage immediately.",
    citations: ["Claims_Process_Guide.pdf"],
  },
  {
    q: "When is my next premium due?",
    a: "Your Life insurance policy (INS-2024-LF-00089) has a premium of ₹24,000 due very soon, on Dec 31 2024. Your Health policy (INS-2024-HL-00487) renews on Jan 15 2025 (₹9,800), and your Motor policy (INS-2024-MT-00312) renews on Mar 1 2025 (₹12,400).",
    citations: ["INS-2024-LF-00089", "INS-2024-HL-00487"],
  },
];

export const mockApplications: Application[] = [
  {
    id: "APP-2024-3341",
    customer: "Meera Joshi",
    type: "Health",
    coverage: 1000000,
    riskScore: 28,
    factors: [
      "Age 29 — low actuarial risk band",
      "No pre-existing conditions declared",
      "Non-smoker, active lifestyle",
      "Stable employment with employer benefits",
    ],
    recommended: "₹12,000 – ₹15,000/yr",
  },
  {
    id: "APP-2024-3340",
    customer: "Rajesh Gupta",
    type: "Motor",
    coverage: 800000,
    riskScore: 55,
    factors: [
      "Vehicle age 4 years — moderate depreciation",
      "One prior claim in last 3 years",
      "Urban metro zone — higher accident frequency",
      "No traffic violations on record",
    ],
    recommended: "₹10,500 – ₹14,000/yr",
  },
  {
    id: "APP-2024-3339",
    customer: "Sunita Rao",
    type: "Life",
    coverage: 5000000,
    riskScore: 72,
    factors: [
      "Age 52 — elevated mortality band",
      "Family history of cardiac conditions",
      "BMI 31 — obese category",
      "High sum assured relative to income",
    ],
    recommended: "₹38,000 – ₹48,000/yr",
  },
  {
    id: "APP-2024-3338",
    customer: "Karthik Nair",
    type: "Health",
    coverage: 500000,
    riskScore: 35,
    factors: [
      "Age 34 — low-moderate risk",
      "Mild asthma — controlled with medication",
      "Non-smoker",
      "No prior claims",
    ],
    recommended: "₹8,500 – ₹11,000/yr",
  },
];
