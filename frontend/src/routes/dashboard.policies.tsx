import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X, Download, FileText, ShieldCheck, Plus } from "lucide-react";
import { Badge, Button, EmptyState, Card, Skeleton } from "@/components/ui-kit";
import { getUserPolicies, getPolicyById } from "@/services/policy";
import { getUserClaims } from "@/services/claims";
import { fmtINR, fmtDate } from "@/lib/format";
import { policyStatusTone, policyStatusLabel } from "@/lib/policy-utils";

export const Route = createFileRoute("/dashboard/policies")({ component: PoliciesPage });

function statusLabel(status: Parameters<typeof policyStatusLabel>[0]) {
  return policyStatusLabel(status);
}

function PoliciesPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["userPolicies"],
    queryFn: getUserPolicies,
  });

  const { data: openPolicy } = useQuery({
    queryKey: ["policy", openId],
    queryFn: () => getPolicyById(openId!),
    enabled: !!openId,
  });

  const { data: allClaims = [] } = useQuery({
    queryKey: ["userClaims"],
    queryFn: getUserClaims,
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">My Policies</h1>
        <Link to="/recommendations">
          <Button leftIcon={<Plus size={16} />}>Buy New Policy</Button>
        </Link>
      </div>

      {policies.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No policies yet"
          description="Your policies will appear here once you buy one."
          action={
            <Link to="/recommendations">
              <Button>Explore plans</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {policies.map((p) => (
            <button
              key={p.id}
              onClick={() => setOpenId(p.id)}
              className="text-left card-base transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between">
                <Badge tone="info">{p.type}</Badge>
                <Badge tone={policyStatusTone(p.status)}>{statusLabel(p.status)}</Badge>
              </div>
              <h3 className="mb-1 font-bold">{p.planName}</h3>
              <div className="mb-1 text-xs text-muted-foreground">{p.provider}</div>
              <div className="mb-3 text-xs font-mono text-muted-foreground">{p.policyNumber}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Coverage</div>
                  <div className="font-semibold">{fmtINR(p.coverage)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Premium</div>
                  <div className="font-semibold">{fmtINR(p.premium)}/yr</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground">Renews on</div>
                  <div className="font-semibold">{fmtDate(p.renewsOn)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {openPolicy && (
        <div className="fixed inset-0 z-50 flex bg-black/40" onClick={() => setOpenId(null)}>
          <div
            className="ml-auto flex h-full w-full max-w-lg flex-col bg-white shadow-2xl page-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b p-5">
              <div>
                <div className="text-xs text-muted-foreground">{openPolicy.policyNumber}</div>
                <h3 className="font-bold">{openPolicy.planName}</h3>
              </div>
              <button onClick={() => setOpenId(null)} className="rounded-lg p-2 hover:bg-muted">
                <X size={18} />
              </button>
            </header>
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Coverage" value={fmtINR(openPolicy.coverage)} />
                <Info label="Premium" value={`${fmtINR(openPolicy.premium)}/yr`} />
                <Info label="Valid from" value={fmtDate(openPolicy.validFrom)} />
                <Info label="Renews on" value={fmtDate(openPolicy.renewsOn)} />
                <Info label="Provider" value={openPolicy.provider} />
                <Info label="Status" value={statusLabel(openPolicy.status)} />
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Coverage breakdown</h4>
                <ul className="space-y-1 text-sm">
                  {openPolicy.coverageBreakdown.map((c) => (
                    <li key={c} className="flex gap-2">
                      ✓ {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Documents</h4>
                {openPolicy.documents.map((d) => (
                  <a
                    key={d.name}
                    className="mb-2 flex items-center justify-between rounded-xl border border-border p-3 text-sm hover:border-primary"
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={14} className="text-primary" />
                      {d.name}
                    </span>
                    <Download size={14} className="text-muted-foreground" />
                  </a>
                ))}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Claim history</h4>
                {allClaims.filter((c) => c.policyId === openPolicy.id).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No claims filed on this policy.</p>
                ) : (
                  <ul className="space-y-2">
                    {allClaims
                      .filter((c) => c.policyId === openPolicy.id)
                      .map((c) => (
                        <li key={c.id} className="rounded-xl border border-border p-3 text-sm">
                          <div className="font-medium">{c.id} · {c.type}</div>
                          <div className="text-xs text-muted-foreground">
                            {fmtINR(c.amount)} · {fmtDate(c.filedAt)} · {c.status}
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold">Nominee</h4>
                <Card className="p-3 text-sm">
                  {openPolicy.nominee.name} · {openPolicy.nominee.relation} · {openPolicy.nominee.phone}
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
