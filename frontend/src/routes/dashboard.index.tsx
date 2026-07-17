import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FilePlus2, Download, Sparkles, UserPlus, Check, ShieldCheck, FileText } from "lucide-react";
import { Button, Badge, Card, EmptyState, Skeleton } from "@/components/ui-kit";
import { useAuthStore } from "@/store/auth";
import { getUserPolicies } from "@/services/policy";
import { getUserClaims } from "@/services/claims";
import { getAuditLog } from "@/services/audit";
import { fmtINR, fmtDate } from "@/lib/format";

export const Route = createFileRoute("/dashboard/")({ component: DashboardHome });

function DashboardHome() {
  const user = useAuthStore((s) => s.user);

  const { data: policies = [], isLoading: policiesLoading, isError: policiesError, error: pErr } = useQuery({
    queryKey: ["userPolicies"],
    queryFn: getUserPolicies,
  });

  const { data: claims = [], isLoading: claimsLoading, isError: claimsError, error: cErr } = useQuery({
    queryKey: ["userClaims"],
    queryFn: getUserClaims,
  });

  const { data: auditLog = [], isLoading: auditLoading, isError: auditError } = useQuery({
    queryKey: ["auditLog"],
    queryFn: getAuditLog,
  });

  const loading = policiesLoading || claimsLoading || auditLoading;
  const hasError = policiesError || claimsError || auditError;

  const totalCoverage = policies.reduce((s, p) => s + (p.coverage || 0), 0);
  const openClaims = claims.filter((c) => c.status === "under_review" || c.status === "submitted").length;
  const active = policies.filter((p) => p.status === "active");
  const hero = active[0];

  const userActions = auditLog.filter(
    (e) => e.actor === user?.name || e.actor === "Arjun Sharma",
  ).slice(0, 5);

  const greeting =
    new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const today = fmtDate(new Date());

  if (loading) return <DashboardSkeleton />;

  if (hasError) {
    const errorMsg = (pErr as Error)?.message || (cErr as Error)?.message || "Failed to load dashboard data from backend server.";
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/5 p-6 text-danger">
        <h2 className="mb-2 text-lg font-bold">Unable to sync dashboard</h2>
        <p className="text-sm">{errorMsg}</p>
        <button onClick={() => window.location.reload()} className="mt-4 rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          {greeting}, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
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
              <div>
                <div className="text-xs text-white/70">Coverage</div>
                <div className="text-lg font-bold">{fmtINR(hero.coverage)}</div>
              </div>
              <div>
                <div className="text-xs text-white/70">Next premium</div>
                <div className="text-lg font-bold">{fmtDate(hero.renewsOn)}</div>
              </div>
              <div>
                <div className="text-xs text-white/70">Policy ID</div>
                <div className="text-lg font-bold">{hero.policyNumber}</div>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="mt-5 bg-white text-primary hover:bg-white/90">
              Renew Policy
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="No active policies yet"
          description="Explore recommended plans tailored to your profile."
          action={
            <Link to="/recommendations">
              <Button>See recommendations</Button>
            </Link>
          }
        />
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
          <QuickAction icon={Download} label="Download Policy" to="/dashboard/documents" />
          <QuickAction icon={Sparkles} label="Talk to AI" to="/dashboard/assistant" />
          <QuickAction icon={UserPlus} label="Add Nominee" to="/dashboard/settings" />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent activity</h3>
        <Card className="p-0">
          {userActions.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No recent activity"
              description="Your policy and claim actions will appear here."
              action={
                <Link to="/dashboard/policies">
                  <Button variant="secondary" size="sm">View policies</Button>
                </Link>
              }
            />
          ) : (
            <ul className="divide-y">
              {userActions.map((r) => (
                <li key={r.eventId} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <div className="font-medium">{formatEventLabel(r.eventType, r.entity)}</div>
                    <div className="text-xs text-muted-foreground">{fmtDate(r.timestamp)}</div>
                  </div>
                  <Badge tone={r.result.startsWith("Success") || r.result === "Verified" ? "success" : "info"}>
                    {r.result.startsWith("Success") ? <Check size={10} /> : null} {r.eventType.split(".")[1] ?? r.result}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function formatEventLabel(eventType: string, entity: string) {
  const labels: Record<string, string> = {
    "policy.issued": `Policy issued · ${entity}`,
    "claim.submitted": `Claim submitted · ${entity}`,
    "document.verified": `Document verified · ${entity}`,
    "fraud.score_computed": `Fraud score computed · ${entity}`,
    "claim.approved": `Claim approved · ${entity}`,
    "claim.rejected": `Claim rejected · ${entity}`,
    login: "Logged in",
    "admin.override": `Admin override · ${entity}`,
    "payment.processed": `Payment processed · ${entity}`,
    "otp.verified": "OTP verified",
  };
  return labels[eventType] ?? `${eventType} · ${entity}`;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
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

function QuickAction({
  icon: Icon,
  label,
  to,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  to?: string;
}) {
  const inner = (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon size={18} />
      </div>
      <div className="text-sm font-semibold">{label}</div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : <button className="text-left">{inner}</button>;
}
