import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Star, FileText, Sparkles } from "lucide-react";
import { Button, AIPanel, Badge } from "@/components/ui-kit";
import { plans, fmtINR } from "@/data/plans";
import { usePolicyStore } from "@/store/policy";

export const Route = createFileRoute("/plans/$id")({ component: PlanDetailPage });

const REVIEWS = [
  { name: "Ananya S.", rating: 5, text: "Claim settled in 2 days. Absolutely painless — the AI walked me through it." },
  { name: "Rahul K.", rating: 5, text: "The AI recommendation was spot on. Better coverage than what I had for less premium." },
  { name: "Deepa R.", rating: 4, text: "Great plan overall. Wish the app had more regional language support." },
];

function PlanDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const setSelected = usePolicyStore((s) => s.setSelected);
  const plan = plans.find((p) => p.id === id);

  if (!plan) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="card-base p-8 text-center">
          <h1 className="mb-3 text-xl font-bold">Plan not found</h1>
          <Link to="/recommendations"><Button>Back to recommendations</Button></Link>
        </div>
      </div>
    );
  }

  function buy() { setSelected(plan!.id); navigate({ to: "/checkout" }); }

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <button onClick={() => navigate({ to: "/recommendations" })} className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3 page-enter">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <Badge tone="info">{plan.type}</Badge>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{plan.name}</h1>
            <p className="mt-2 text-muted-foreground">{plan.provider} · {plan.tier} tier</p>
          </div>

          <AIPanel title="Why this suits you">{plan.aiInsight}</AIPanel>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Key features</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {plan.features.map((f) => (
                <div key={f} className="flex items-start gap-2 rounded-xl bg-white p-3 border border-border/60">
                  <Check size={16} className="mt-0.5 shrink-0 text-success" />
                  <span className="text-sm">{f}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">What's covered</h2>
            <ul className="space-y-2">
              {plan.covered.map((c) => <li key={c} className="flex gap-2 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-success" />{c}</li>)}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Exclusions</h2>
            <ul className="space-y-2">
              {plan.excluded.map((c) => <li key={c} className="flex gap-2 text-sm text-muted-foreground">• {c}</li>)}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Policy documents</h2>
            <div className="space-y-2">
              {["Policy Wording (PDF)", "Prospectus (PDF)", "Claim Form (PDF)"].map((d) => (
                <a key={d} className="flex items-center gap-3 rounded-xl border border-border bg-white p-3 text-sm hover:border-primary hover:bg-secondary/40">
                  <FileText size={16} className="text-primary" /> {d}
                </a>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Customer reviews</h2>
            <div className="space-y-3">
              {REVIEWS.map((r) => (
                <div key={r.name} className="card-base">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-semibold">{r.name}</div>
                    <div className="flex text-amber-500">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="card-base p-6">
            <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Coverage</div>
            <div className="mb-4 text-3xl font-bold">{fmtINR(plan.coverage)}</div>
            <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Annual premium</div>
            <div className="mb-4 text-xl font-bold">{fmtINR(plan.premium)}</div>
            <div className="mb-4 flex items-center justify-between rounded-xl bg-secondary p-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-primary"><Sparkles size={12} /> AI Match Score</span>
              <span className="text-lg font-bold text-primary">{plan.matchScore}%</span>
            </div>
            <Button className="w-full" onClick={buy}>Get This Plan</Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">Free 15-day cancellation</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
