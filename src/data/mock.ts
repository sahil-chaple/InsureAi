export const mockClaimsQueue = [
  { id: "CLM-2024-88421", customer: "Arjun Mehta", type: "Health", amount: 42000, submitted: "2 hours ago", fraudScore: 12, fraudLevel: "Low", status: "In Review",
    flags: ["Standard hospital, network partner", "Diagnosis matches policy coverage", "No prior claim in last 12 months"] },
  { id: "CLM-2024-88420", customer: "Sneha Rao", type: "Motor", amount: 78500, submitted: "5 hours ago", fraudScore: 68, fraudLevel: "High", status: "In Review",
    flags: ["Claim filed 3 days after policy started (unusual timing)", "Repair estimate 40% above segment average", "Repair shop not in trusted network"] },
  { id: "CLM-2024-88419", customer: "Rohan Iyer", type: "Health", amount: 15200, submitted: "1 day ago", fraudScore: 28, fraudLevel: "Low", status: "Approved",
    flags: ["Diagnosis consistent with claim", "Hospital verified", "Amount within norms"] },
  { id: "CLM-2024-88418", customer: "Meera Nair", type: "Travel", amount: 8400, submitted: "1 day ago", fraudScore: 42, fraudLevel: "Medium", status: "In Review",
    flags: ["Claim submitted from location differing from trip itinerary", "Receipts show minor formatting inconsistency"] },
  { id: "CLM-2024-88417", customer: "Karthik Rao", type: "Motor", amount: 22000, submitted: "2 days ago", fraudScore: 15, fraudLevel: "Low", status: "Approved", flags: ["All checks passed"] },
];

export const mockApplications = [
  { id: "APP-2024-3341", customer: "Aisha Khan", type: "Health", coverage: 2000000, riskScore: 32, factors: ["Non-smoker, age 32", "No pre-existing conditions", "Sedentary occupation offset by fitness score"], recommended: "₹9,800 — ₹12,400" },
  { id: "APP-2024-3340", customer: "Vikram Shah", type: "Life", coverage: 10000000, riskScore: 58, factors: ["Age 44", "Diabetes (declared)", "Family history of heart disease", "Non-smoker"], recommended: "₹18,600 — ₹22,000" },
  { id: "APP-2024-3339", customer: "Priya Gupta", type: "Motor", coverage: 800000, riskScore: 22, factors: ["Vehicle < 2 years old", "Clean driving record", "Urban zone"], recommended: "₹6,200 — ₹7,400" },
];

export const mockAgentActivity = [
  { agent: "Recommendation Agent", action: "Ranked 32 plans", confidence: 0.94, input: "Customer profile #A-4482", output: "Top 6 plans surfaced", override: false, time: "1 min ago" },
  { agent: "Fraud Detector", action: "Scored claim", confidence: 0.87, input: "CLM-2024-88420", output: "Fraud score: 68 (High)", override: false, time: "2 min ago" },
  { agent: "Document AI", action: "Verified ID", confidence: 0.99, input: "Aadhaar upload", output: "Identity confirmed", override: false, time: "4 min ago" },
  { agent: "Underwriting Agent", action: "Assessed application", confidence: 0.81, input: "APP-2024-3340", output: "Risk score 58", override: true, time: "8 min ago" },
  { agent: "Claim Pre-Assessor", action: "Pre-approved claim", confidence: 0.92, input: "CLM-2024-88419", output: "Recommend approve", override: false, time: "12 min ago" },
];

export const mockAuditLog = [
  { eventId: "EVT-000198", ts: "2024-11-01 14:22:03", actor: "priya@insureai.com", action: "Claim.Approve", entity: "CLM-2024-88419", ip: "10.24.1.44", result: "Success" },
  { eventId: "EVT-000197", ts: "2024-11-01 14:15:47", actor: "system:fraud-agent", action: "Claim.Score", entity: "CLM-2024-88420", ip: "internal", result: "Score=68" },
  { eventId: "EVT-000196", ts: "2024-11-01 13:58:11", actor: "rahul@insureai.com", action: "Policy.PremiumOverride", entity: "APP-2024-3340", ip: "10.24.1.51", result: "Success" },
  { eventId: "EVT-000195", ts: "2024-11-01 13:44:20", actor: "arjun@customer", action: "Policy.Purchase", entity: "INS-2024-HL-00487", ip: "203.0.113.14", result: "Success" },
  { eventId: "EVT-000194", ts: "2024-11-01 13:22:08", actor: "system:doc-ai", action: "Document.Verify", entity: "AADHAAR-XXXX-4521", ip: "internal", result: "Verified" },
];
