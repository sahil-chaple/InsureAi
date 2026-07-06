import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, LayoutDashboard, Check } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui-kit";
import { usePolicyStore } from "@/store/policy";
import { useAuthStore } from "@/store/auth";
import { plans, fmtINR } from "@/data/plans";
import { issuePolicy } from "@/services/policy";
import { toast } from "sonner";

export const Route = createFileRoute("/policy/issued")({ component: PolicyIssuedPage });

function PolicyIssuedPage() {
  const navigate = useNavigate();
  const selectedId = usePolicyStore((s) => s.selectedPlanId);
  const addPolicy = usePolicyStore((s) => s.addPolicy);
  const user = useAuthStore((s) => s.user);
  const [policy, setPolicy] = useState<any>(null);
  const plan = useMemo(() => plans.find((p) => p.id === selectedId) || plans[0], [selectedId]);

  useEffect(() => {
    (async () => {
      const p = await issuePolicy(plan.id, user?.name || "Customer");
      setPolicy(p);
      addPolicy(p);
    })();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.3 }, colors: ["#4F46E5", "#7C3AED", "#059669"] });
    const t = setTimeout(() => confetti({ particleCount: 60, spread: 60, origin: { y: 0.4 }, colors: ["#4F46E5", "#7C3AED"] }), 500);
    return () => clearTimeout(t);
  }, [plan.id, user?.name, addPolicy]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg text-center page-enter">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/10 scale-pulse">
          <svg viewBox="0 0 52 52" className="h-16 w-16">
            <circle cx="26" cy="26" r="24" fill="none" stroke="#059669" strokeWidth="3" />
            <path d="M14 27l8 8 16-18" fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="100" style={{ animation: "draw-check 0.8s ease forwards" }} />
          </svg>
        </div>
        <h1 className="mb-2 text-3xl font-bold sm:text-4xl">Your Policy is Active! 🎉</h1>
        <p className="mb-8 text-muted-foreground">Policy issued in under 60 seconds.</p>

        <div className="card-base p-6 text-left">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase text-muted-foreground">Policy ID</div>
              <div className="font-bold">{policy?.id || "—"}</div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><Check size={12} /> Active</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs text-muted-foreground">Plan</div>
              <div className="font-semibold">{plan.name}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Coverage</div>
              <div className="font-semibold">{fmtINR(plan.coverage)}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Valid from</div>
              <div className="font-semibold">{policy ? new Date(policy.validFrom).toLocaleDateString() : "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Valid to</div>
              <div className="font-semibold">{policy ? new Date(policy.validTo).toLocaleDateString() : "—"}</div>
            </div>
            <div className="sm:col-span-2">
              <div className="text-xs text-muted-foreground">Policyholder</div>
              <div className="font-semibold">{user?.name || "Customer"}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button variant="secondary" className="flex-1" leftIcon={<Download size={16} />} onClick={() => toast.success("Policy PDF downloaded")}>Download Policy PDF</Button>
          <Button className="flex-1" leftIcon={<LayoutDashboard size={16} />} onClick={() => navigate({ to: "/dashboard" })}>Go to My Dashboard</Button>
        </div>
      </div>
    </div>
  );
}
