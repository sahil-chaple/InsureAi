import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Sparkles, Check, ArrowRight, Heart, Car, ShieldCheck } from "lucide-react";
import { Button, Badge, AIBadge, Logo, Skeleton } from "@/components/ui-kit";
import { getRecommendations } from "@/services/policy";
import { usePolicyStore } from "@/store/policy";
import { useOnboarding } from "@/store/onboarding";
import { fmtINR } from "@/lib/format";
import type { RecommendationPlan } from "@/data/mockData";
import { toast } from "sonner";

export const Route = createFileRoute("/recommendations")({ component: RecommendationsPage });

const TYPE_ICON: Record<RecommendationPlan["type"], React.ComponentType<{ size?: number }>> = {
  Health: Heart,
  Motor: Car,
  Life: ShieldCheck,
};

function RecommendationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"All" | RecommendationPlan["type"]>("All");
  const { comparedPlanIds, toggleCompare, clearCompare, selectPlan } = usePolicyStore();
  const riskProfile = useOnboarding((s) => s.riskProfile);

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["recommendations"],
    queryFn: getRecommendations,
  });

  const filtered = useMemo(() => {
    if (filter === "All") return plans;
    return plans.filter((p) => p.type === filter);
  }, [plans, filter]);

  function handleSelect(plan: RecommendationPlan) {
    selectPlan(plan);
    toast.success(`Selected ${plan.name}`);
    navigate({ to: "/checkout" });
  }

  return (
    <div className="min-h-dvh bg-background pb-32">
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex items-center gap-1.5 font-bold">
            <Logo />
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" size="sm">
              My Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 page-enter">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Your Personalized Insurance Plans</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Based on your profile, our AI recommends the following plans. Tap any plan to explore or compare up to 3.
        </p>

        {riskProfile && (
          <div className="mt-6 rounded-2xl border border-primary/20 bg-gradient-to-r from-indigo-50 to-violet-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <AIBadge />
              <h2 className="font-semibold">Your Risk Profile</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Health Risk", value: riskProfile.healthRisk, icon: Heart },
                { label: "Asset Exposure", value: riskProfile.assetExposure, icon: Car },
                { label: "Life Cover Need", value: riskProfile.lifeCoverNeed, icon: ShieldCheck },
                {
                  label: "Recommended Budget",
                  value: `${fmtINR(riskProfile.recommendedBudgetMin)} — ${fmtINR(riskProfile.recommendedBudgetMax)}/yr`,
                  icon: Sparkles,
                },
              ].map((m) => (
                <div key={m.label} className="rounded-xl bg-white p-4">
                  <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <m.icon size={14} className="text-primary" /> {m.label}
                  </div>
                  <div className="text-lg font-bold">{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {(["All", "Health", "Motor", "Life"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "border-primary bg-secondary text-primary"
                  : "border-border bg-white text-foreground hover:border-primary/50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-12 text-center text-muted-foreground">No plans match this filter.</div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const inCompare = comparedPlanIds.includes(p.id);
              const Icon = TYPE_ICON[p.type];
              return (
                <div
                  key={p.id}
                  className={`relative card-base p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                    p.isRecommended ? "ring-2 ring-primary shadow-[0_8px_32px_rgba(79,70,229,0.25)]" : ""
                  }`}
                >
                  {p.isRecommended && (
                    <div className="absolute -top-3 left-4">
                      <Badge tone="ai">
                        <Sparkles size={10} /> Best Match
                      </Badge>
                    </div>
                  )}
                  <div className="absolute right-4 top-4">
                    <MatchRing score={p.matchScore} />
                  </div>

                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
                      <Icon size={16} />
                    </div>
                    <Badge tone="info">{p.type}</Badge>
                  </div>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {p.provider} · {p.tier}
                  </div>
                  <h3 className="mb-2 pr-14 text-lg font-bold leading-tight">{p.name}</h3>

                  <div className="mb-1 text-3xl font-bold tracking-tight">{fmtINR(p.coverage)}</div>
                  <div className="text-sm text-muted-foreground">
                    coverage · <span className="font-medium text-foreground">{fmtINR(p.premium)}</span>/yr
                  </div>

                  <ul className="my-4 space-y-1.5 text-sm">
                    {p.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check size={14} className="mt-0.5 shrink-0 text-success" />
                        <span className="text-foreground/85">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => toggleCompare(p.id)}>
                      {inCompare ? "In Compare" : "Compare"}
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => handleSelect(p)}>
                      Select Plan
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {comparedPlanIds.length >= 2 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 mx-auto max-w-3xl rounded-2xl border border-border bg-white p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] page-enter">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1">
              <div className="text-xs font-semibold text-muted-foreground">COMPARING {comparedPlanIds.length} PLANS</div>
              <div className="mt-1 truncate text-sm font-medium">
                {comparedPlanIds.map((id) => plans.find((p) => p.id === id)?.name).join(" · ")}
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={clearCompare}>
              Clear
            </Button>
            <Button size="sm" onClick={() => navigate({ to: "/compare" })} rightIcon={<ArrowRight size={14} />}>
              Compare Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MatchRing({ score }: { score: number }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div className="relative h-12 w-12">
      <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
        <circle cx="24" cy="24" r={r} stroke="#E5E7EB" strokeWidth="4" fill="none" />
        <defs>
          <linearGradient id="mr" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#4F46E5" />
            <stop offset="1" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <circle
          cx="24"
          cy="24"
          r={r}
          stroke="url(#mr)"
          strokeWidth="4"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold">{score}%</div>
    </div>
  );
}
