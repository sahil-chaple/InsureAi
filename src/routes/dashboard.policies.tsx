import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { X, Download, FileText, ShieldCheck } from "lucide-react";
import { Badge, Button, EmptyState, Card } from "@/components/ui-kit";
import { usePolicyStore } from "@/store/policy";
import { plans, fmtINR } from "@/data/plans";

export const Route = createFileRoute("/dashboard/policies")({ component: PoliciesPage });

function PoliciesPage() {
  const policies = usePolicyStore((s) => s.policies);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = policies.find((p) => p.id === openId);
  const plan = open && plans.find((pl) => pl.id === open.planId);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Policies</h1>
      {policies.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No policies yet" description="Your policies will appear here once you buy one." action={<Link to="/recommendations"><Button>Explore plans</Button></Link>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((p) => (
            <button key={p.id} onClick={() => setOpenId(p.id)} className="text-left card-base transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-3 flex items-center justify-between">
                <Badge tone="info">{p.type}</Badge>
                <Badge tone={p.status === "Active" ? "success" : p.status === "Expiring" ? "warning" : "danger"}>{p.status}</Badge>
              </div>
              <h3 className="mb-1 font-bold">{p.planName}</h3>
              <div className="mb-3 text-xs text-muted-foreground">{p.id}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="text-xs text-muted-foreground">Coverage</div><div className="font-semibold">{fmtINR(p.coverage)}</div></div>
                <div><div className="text-xs text-muted-foreground">Premium</div><div className="font-semibold">{fmtINR(p.premium)}/yr</div></div>
                <div className="col-span-2"><div className="text-xs text-muted-foreground">Renews on</div><div className="font-semibold">{new Date(p.validTo).toLocaleDateString()}</div></div>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && plan && (
        <div className="fixed inset-0 z-50 flex bg-black/40" onClick={() => setOpenId(null)}>
          <div className="ml-auto flex h-full w-full max-w-lg flex-col bg-white shadow-2xl page-enter" onClick={(e) => e.stopPropagation()}>
            <header className="flex items-center justify-between border-b p-5">
              <div>
                <div className="text-xs text-muted-foreground">{open.id}</div>
                <h3 className="font-bold">{open.planName}</h3>
              </div>
              <button onClick={() => setOpenId(null)} className="rounded-lg p-2 hover:bg-muted"><X size={18} /></button>
            </header>
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Coverage" value={fmtINR(open.coverage)} />
                <Info label="Premium" value={`${fmtINR(open.premium)}/yr`} />
                <Info label="Valid from" value={new Date(open.validFrom).toLocaleDateString()} />
                <Info label="Valid to" value={new Date(open.validTo).toLocaleDateString()} />
                <Info label="Holder" value={open.holder} />
                <Info label="Status" value={open.status} />
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Coverage breakdown</h4>
                <ul className="space-y-1 text-sm">
                  {plan.covered.map((c) => <li key={c} className="flex gap-2">✓ {c}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Documents</h4>
                {["Policy Wording", "Tax invoice", "Claim form"].map((d) => (
                  <a key={d} className="flex items-center justify-between rounded-xl border border-border p-3 text-sm hover:border-primary mb-2">
                    <span className="flex items-center gap-2"><FileText size={14} className="text-primary" />{d}</span>
                    <Download size={14} className="text-muted-foreground" />
                  </a>
                ))}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Nominee</h4>
                <Card className="p-3 text-sm">Priya Mehta · Spouse · +91 98XX XX0021</Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs text-muted-foreground">{label}</div><div className="font-semibold">{value}</div></div>;
}
