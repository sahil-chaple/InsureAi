import { createFileRoute, Link } from "@tanstack/react-router";
import { FilePlus2, Download, Sparkles, UserPlus, Check, ShieldCheck } from "lucide-react";
import { Button, Badge, Card, EmptyState } from "@/components/ui-kit";
import { useAuthStore } from "@/store/auth";
import { usePolicyStore } from "@/store/policy";
import { useClaimsStore } from "@/store/claims";
import { fmtINR } from "@/data/plans";

export const Route = createFileRoute("/dashboard/")({ component: DashboardHome });

function DashboardHome() {
  const user = useAuthStore((s) => s.user);
  const policies = usePolicyStore((s) => s.policies);
  const claims = useClaimsStore((s) => s.claims);

  const totalCoverage = policies.reduce((s, p) => s + p.coverage, 0);
  const openClaims = claims.filter((c) => c.status === "In Review" || c.status === "Submitted").length;
  const active = policies.filter((p) => p.status === "Active");
  const hero = active[0];

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{greeting}, {user?.name?.split(" ")[0] || "there"} 👋</h1>
        <p className="text-sm text-muted-foreground">{today}</p>
      </div>

      {hero ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-6 text-white sm:p-8">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -right-4 h-52 w-52 rounded-full bg-white/5" />
          <div className="relative">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/80">Active Policy</div>
            <h2 className="text-2xl font-bold sm:text-3xl">{hero.planName}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div><div className="text-xs text-white/70">Coverage</div><div className="text-lg font-bold">{fmtINR(hero.coverage)}</div></div>
              <div><div className="text-xs text-white/70">Next premium</div><div className="text-lg font-bold">{new Date(hero.validTo).toLocaleDateString()}</div></div>
              <div><div className="text-xs text-white/70">Policy ID</div><div className="text-lg font-bold">{hero.id.slice(0, 14)}…</div></div>
            </div>
            <Button variant="secondary" size="sm" className="mt-5 bg-white text-primary hover:bg-white/90">Renew Policy</Button>
          </div>
        </div>
      ) : (
        <EmptyState icon={ShieldCheck} title="No active policies yet" description="Explore recommended plans tailored to your profile." action={<Link to="/recommendations"><Button>See recommendations</Button></Link>} />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active Policies" value={active.length} />
        <Stat label="Open Claims" value={openClaims} />
        <Stat label="Total Coverage" value={fmtINR(totalCoverage || 0)} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Quick actions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAction icon={FilePlus2} label="File a Claim" to="/dashboard/claims/new" />
          <QuickAction icon={Download} label="Download Policy" />
          <QuickAction icon={Sparkles} label="Talk to AI" to="/dashboard/assistant" />
          <QuickAction icon={UserPlus} label="Add Nominee" />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent activity</h3>
        <Card className="p-0">
          <ul className="divide-y">
            {[...claims.slice(0, 3).map((c) => ({ title: `Claim ${c.id} · ${c.type}`, when: new Date(c.submittedAt).toLocaleDateString(), badge: <Badge tone="warning">{c.status}</Badge> })),
              ...policies.slice(0, 3).map((p) => ({ title: `Policy issued · ${p.planName}`, when: new Date(p.validFrom).toLocaleDateString(), badge: <Badge tone="success"><Check size={10} /> Active</Badge> })),
            ].map((r, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.when}</div>
                </div>
                {r.badge}
              </li>
            ))}
            {policies.length === 0 && claims.length === 0 && (
              <li className="py-8 text-center text-sm text-muted-foreground">No activity yet.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </Card>
  );
}

function QuickAction({ icon: Icon, label, to }: { icon: React.ComponentType<{ size?: number }>; label: string; to?: string }) {
  const inner = (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><Icon size={18} /></div>
      <div className="text-sm font-semibold">{label}</div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : <button className="text-left">{inner}</button>;
}
