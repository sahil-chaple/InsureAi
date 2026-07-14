export type Plan = {
  id: string;
  provider: string;
  type: "Health" | "Motor" | "Life" | "Travel" | "Home";
  name: string;
  tier: "Basic" | "Standard" | "Premium" | "Elite";
  coverage: number;
  premium: number;
  deductible: number;
  term: string;
  matchScore: number;
  features: string[];
  covered: string[];
  excluded: string[];
  settlement: string;
  avgClaimDays: number;
  addOns: string[];
  aiInsight: string;
};

export const plans: Plan[] = [
  {
    id: "hl-elite-1",
    provider: "Aegis Health",
    type: "Health",
    name: "Aegis Complete Care",
    tier: "Elite",
    coverage: 2000000,
    premium: 11400,
    deductible: 0,
    term: "1 year",
    matchScore: 96,
    features: ["Cashless at 8,000+ hospitals", "Pre & post hospitalisation (60/90 days)", "No room rent cap", "Restore benefit 100%", "Free annual health check-up"],
    covered: ["Hospitalisation", "Day-care procedures", "AYUSH treatment", "Mental health", "Maternity (after 2y)"],
    excluded: ["Cosmetic surgery", "Self-inflicted injuries"],
    settlement: "Cashless / Reimbursement",
    avgClaimDays: 2,
    addOns: ["Critical illness", "OPD cover", "Personal accident"],
    aiInsight: "Best match for your health profile — no room-rent cap and full restore benefit suit families.",
  },
  {
    id: "hl-standard-1",
    provider: "Cura Insure",
    type: "Health",
    name: "Cura Shield Plus",
    tier: "Standard",
    coverage: 1000000,
    premium: 7200,
    deductible: 10000,
    term: "1 year",
    matchScore: 89,
    features: ["Cashless at 5,000+ hospitals", "Pre & post hospitalisation (30/60 days)", "Room rent capped at 1%", "50% restore", "Annual check-up"],
    covered: ["Hospitalisation", "Day-care", "Ambulance"],
    excluded: ["AYUSH", "Mental health"],
    settlement: "Cashless / Reimbursement",
    avgClaimDays: 4,
    addOns: ["Critical illness", "Top-up"],
    aiInsight: "Solid value plan — trade-off is a room rent cap.",
  },
  {
    id: "mt-premium-1",
    provider: "DriveSafe",
    type: "Motor",
    name: "DriveSafe Comprehensive",
    tier: "Premium",
    coverage: 800000,
    premium: 6800,
    deductible: 2000,
    term: "1 year",
    matchScore: 91,
    features: ["Zero depreciation", "Engine protect", "Roadside assistance 24/7", "Consumables cover", "Return to invoice"],
    covered: ["Third party liability", "Own damage", "Theft", "Natural disasters"],
    excluded: ["Wear & tear", "Racing"],
    settlement: "Cashless garages",
    avgClaimDays: 3,
    addOns: ["Key replacement", "NCB protect"],
    aiInsight: "Zero-dep + engine protect is a strong combo for a car under 5 years old.",
  },
  {
    id: "lf-elite-1",
    provider: "Everlife",
    type: "Life",
    name: "Everlife Secure Term",
    tier: "Elite",
    coverage: 10000000,
    premium: 9800,
    deductible: 0,
    term: "40 years",
    matchScore: 94,
    features: ["₹1 Cr cover", "Terminal illness benefit", "Waiver on disability", "Increasing cover option", "Return of premium option"],
    covered: ["Death", "Terminal illness", "Total permanent disability"],
    excluded: ["Suicide within 1 year"],
    settlement: "Direct beneficiary payout",
    avgClaimDays: 7,
    addOns: ["Critical illness rider", "Accidental death"],
    aiInsight: "High life cover need detected — this plan gives ₹1 Cr protection at a competitive premium.",
  },
  {
    id: "tv-standard-1",
    provider: "GlobeCover",
    type: "Travel",
    name: "GlobeCover International",
    tier: "Standard",
    coverage: 500000,
    premium: 1200,
    deductible: 5000,
    term: "Per trip",
    matchScore: 82,
    features: ["Medical emergency abroad", "Trip cancellation", "Baggage loss", "Flight delay", "Passport loss"],
    covered: ["Emergency medical", "Trip curtailment", "Personal liability"],
    excluded: ["Adventure sports", "Pre-existing conditions"],
    settlement: "Cashless via international network",
    avgClaimDays: 5,
    addOns: ["Adventure sports rider"],
    aiInsight: "You travel occasionally — a per-trip plan is more economical than annual.",
  },
  {
    id: "hm-standard-1",
    provider: "Homefort",
    type: "Home",
    name: "Homefort Essentials",
    tier: "Standard",
    coverage: 1500000,
    premium: 4200,
    deductible: 5000,
    term: "1 year",
    matchScore: 85,
    features: ["Structure & contents", "Fire & natural calamities", "Theft & burglary", "Electrical breakdown", "Temporary accommodation"],
    covered: ["Fire", "Flood", "Earthquake", "Theft"],
    excluded: ["War", "Nuclear risks"],
    settlement: "Reimbursement",
    avgClaimDays: 10,
    addOns: ["Jewellery cover", "Electronic equipment"],
    aiInsight: "Covers both structure and contents — right sized for your property value.",
  },
];

export function fmtINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}
