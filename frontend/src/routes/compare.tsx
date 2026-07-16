import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, X, Sparkles } from "lucide-react";
import { Button, AIBadge, Skeleton } from "@/components/ui-kit";
import { getRecommendations } from "@/services/policy";
import { usePolicyStore } from "@/store/policy";
import { fmtINR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/compare")({ component: ComparePage });

function ComparePage() {
  const navigate = useNavigate();
  const { comparedPlanIds, selectPlan } = usePolicyStore();

  const { data: allPlans = [], isLoading, isError, error } = useQuery({
    queryKey: ["recommendations"],
    queryFn: getRecommendations,
  });

  const selected = allPlans.filter((p) => comparedPlanIds.includes(p.id));

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-background p-8">
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-dvh bg-background p-8">
        <div className="rounded-2xl border border-danger/30 bg-danger/5 p-6 text-danger">
          <h2 className="mb-2 text-lg font-bold">Failed to load plans for comparison</h2>
          <p className="text-sm">{(error as Error)?.message || "Server connection error."}</p>
        </div>
      </div>
    );
  }

  if (selected.length < 2) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="card-base p-8 text-center">
          <h1 className="mb-2 text-xl font-bold">Add plans to compare</h1>
          <p className="mb-6 text-sm text-muted-foreground">Pick at least 2 plans from recommendations.</p>
          <Button onClick={() => navigate({ to: "/recommendations" })}>Back to recommendations</Button>
        </div>
      </div>
    );
  }

  const cols = selected.length;
  const gridCols = { 2: "grid-cols-3", 3: "grid-cols-4" }[cols] || "grid-cols-3";

  function pick(plan: (typeof selected)[0]) {
    selectPlan(plan);
    toast.success(`Selected ${plan.name}`);
    navigate({ to: "/checkout" });
  }

  return (
    <div className="min-h-dvh bg-background pb-12">
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            onClick={() => navigate({ to: "/recommendations" })}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <span className="text-sm font-semibold">Compare {cols} plans</span>
        </div>
        <div className={`mx-auto grid max-w-7xl gap-3 border-t bg-white px-4 py-3 sm:px-6 ${gridCols}`}>
          <div />
          {selected.map((p) => (
            <div key={p.id} className="text-center">
              <div className="text-xs font-semibold uppercase text-muted-foreground">{p.provider}</div>
              <div className="text-sm font-bold">{p.name}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 page-enter">
        <Section title="Overview" cols={gridCols}>
          <Row label="Coverage" cols={gridCols}>
            {selected.map((p) => (
              <Cell key={p.id}>{fmtINR(p.coverage)}</Cell>
            ))}
          </Row>
          <Row label="Premium / yr" cols={gridCols}>
            {selected.map((p) => (
              <Cell key={p.id}>{fmtINR(p.premium)}</Cell>
            ))}
          </Row>
          <Row label="Deductible" cols={gridCols}>
            {selected.map((p) => (
              <Cell key={p.id}>{fmtINR(p.deductible)}</Cell>
            ))}
          </Row>
          <Row label="Term" cols={gridCols}>
            {selected.map((p) => (
              <Cell key={p.id}>{p.term}</Cell>
            ))}
          </Row>
          <Row label="AI Match" cols={gridCols}>
            {selected.map((p) => (
              <Cell key={p.id}>{p.matchScore}%</Cell>
            ))}
          </Row>
        </Section>

        <Section title="What's covered" cols={gridCols}>
          {Array.from(new Set(selected.flatMap((p) => p.covered))).map((item) => (
            <Row key={item} label={item} cols={gridCols}>
              {selected.map((p) => (
                <Cell key={p.id}>
                  {p.covered.includes(item) ? (
                    <Check size={16} className="mx-auto text-success" />
                  ) : (
                    <X size={16} className="mx-auto text-muted-foreground" />
                  )}
                </Cell>
              ))}
            </Row>
          ))}
        </Section>

        <Section title="What's not covered" cols={gridCols}>
          {Array.from(new Set(selected.flatMap((p) => p.excluded))).map((item) => (
            <Row key={item} label={item} cols={gridCols}>
              {selected.map((p) => (
                <Cell key={p.id}>
                  {p.excluded.includes(item) ? (
                    <X size={16} className="mx-auto text-danger" />
                  ) : (
                    <Check size={16} className="mx-auto text-success" />
                  )}
                </Cell>
              ))}
            </Row>
          ))}
        </Section>

        <Section title="Claim process" cols={gridCols}>
          <Row label="Settlement" cols={gridCols}>
            {selected.map((p) => (
              <Cell key={p.id}>{p.settlement}</Cell>
            ))}
          </Row>
          <Row label="Avg. claim time" cols={gridCols}>
            {selected.map((p) => (
              <Cell key={p.id}>{p.avgClaimDays} days</Cell>
            ))}
          </Row>
        </Section>

        <Section title="Add-ons" cols={gridCols}>
          {Array.from(new Set(selected.flatMap((p) => p.addOns))).map((item) => (
            <Row key={item} label={item} cols={gridCols}>
              {selected.map((p) => (
                <Cell key={p.id}>
                  {p.addOns.includes(item) ? (
                    <Check size={16} className="mx-auto text-success" />
                  ) : (
                    <X size={16} className="mx-auto text-muted-foreground" />
                  )}
                </Cell>
              ))}
            </Row>
          ))}
        </Section>

        <div className={`mt-6 grid gap-3 rounded-2xl border border-primary/20 bg-[#FAFAFE] p-5 ${gridCols}`}>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <span className="font-semibold text-primary">AI Insight</span>
            <AIBadge />
          </div>
          {selected.map((p) => (
            <div key={p.id} className="text-sm text-foreground/90">
              {p.aiInsight}
            </div>
          ))}
        </div>

        <div className={`mt-6 grid gap-3 ${gridCols}`}>
          <div />
          {selected.map((p) => (
            <Button key={p.id} className="w-full" onClick={() => pick(p)}>
              Select This Plan
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Section({ title, cols, children }: { title: string; cols: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="card-base overflow-hidden p-0">{children}</div>
    </div>
  );
}

function Row({ label, cols, children }: { label: string; cols: string; children: React.ReactNode }) {
  return (
    <div className={`grid items-center border-b border-border/60 px-4 py-3 last:border-0 ${cols}`}>
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <div className="text-center text-sm font-medium">{children}</div>;
}
