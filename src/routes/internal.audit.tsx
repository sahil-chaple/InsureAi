import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download, Filter } from "lucide-react";
import { Card, Button, Badge, Input, AIBadge, Skeleton } from "@/components/ui-kit";
import { getAuditLog, filterAuditLog, exportAuditCsv } from "@/services/audit";
import { getAgentActivity } from "@/services/ai";
import { fmtDate } from "@/lib/format";
import { toast } from "sonner";
import { requireAuth } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/internal/audit")({
  component: AuditPage,
  beforeLoad: requireAuth(["auditor", "admin"]),
});

const EVENT_TYPES = [
  "all",
  "policy.issued",
  "claim.submitted",
  "document.verified",
  "fraud.score_computed",
  "claim.approved",
  "claim.rejected",
  "login",
  "admin.override",
  "payment.processed",
  "otp.verified",
];

const ACTORS = ["all", "Arjun Sharma", "AI Agent", "System", "Priya Reviewer", "Neha Admin"];

function AuditPage() {
  const [tab, setTab] = useState<"log" | "ai">("log");
  const [search, setSearch] = useState("");
  const [actor, setActor] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: auditLog = [], isLoading: logLoading } = useQuery({
    queryKey: ["auditLog"],
    queryFn: getAuditLog,
  });

  const { data: agentActivity = [], isLoading: aiLoading } = useQuery({
    queryKey: ["agentActivity"],
    queryFn: getAgentActivity,
  });

  const rows = useMemo(
    () => filterAuditLog(auditLog, { search, actor, eventType, dateFrom, dateTo }),
    [auditLog, search, actor, eventType, dateFrom, dateTo],
  );

  function handleExport() {
    const csv = exportAuditCsv(rows);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "insureai-audit-log.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit log exported (CSV)");
  }

  if (logLoading) {
    return (
      <div>
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Audit</h1>
          <p className="text-sm text-muted-foreground">Immutable log of every action across the platform.</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          <button
            onClick={() => setTab("log")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              tab === "log" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            Audit log
          </button>
          <button
            onClick={() => setTab("ai")}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              tab === "ai" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            AI decisions
          </button>
        </div>
      </div>

      {tab === "log" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="min-w-[200px] flex-1">
              <Input placeholder="Search actor, event, entity…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <select
              value={actor}
              onChange={(e) => setActor(e.target.value)}
              className="rounded-xl border-[1.5px] border-border bg-white px-3 py-2.5 text-sm"
            >
              {ACTORS.map((a) => (
                <option key={a} value={a}>
                  {a === "all" ? "All actors" : a}
                </option>
              ))}
            </select>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="rounded-xl border-[1.5px] border-border bg-white px-3 py-2.5 text-sm"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "all" ? "All events" : t}
                </option>
              ))}
            </select>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" />
            <Button variant="secondary" leftIcon={<Filter size={14} />}>
              {rows.length} results
            </Button>
            <Button variant="secondary" leftIcon={<Download size={14} />} onClick={handleExport}>
              Export CSV
            </Button>
          </div>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] font-mono text-sm">
                <thead className="bg-muted/50 text-left font-sans text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Event ID</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Event Type</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">IP</th>
                    <th className="px-4 py-3">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center font-sans text-muted-foreground">
                        No audit entries match your filters.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => (
                      <tr key={r.eventId} className="border-t">
                        <td className="px-4 py-3 text-xs">{r.eventId}</td>
                        <td className="px-4 py-3 text-xs">{fmtDate(r.timestamp)}</td>
                        <td className="px-4 py-3 text-xs">{r.actor}</td>
                        <td className="px-4 py-3 text-xs">{r.eventType}</td>
                        <td className="px-4 py-3 text-xs">{r.entity}</td>
                        <td className="px-4 py-3 text-xs">{r.ip}</td>
                        <td className="px-4 py-3">
                          <Badge tone="success">{r.result}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {tab === "ai" && (
        <div className="space-y-4">
          {aiLoading ? (
            <Skeleton className="h-48 rounded-2xl" />
          ) : (
            agentActivity.map((a, i) => (
              <Card key={a.id ?? i}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AIBadge />
                    <h4 className="font-semibold">
                      {a.agentName} — {a.action}
                    </h4>
                  </div>
                  <div className="text-xs text-muted-foreground">{a.timestamp}</div>
                </div>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="ai-panel rounded-xl bg-muted/50 p-3">
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Full prompt</div>
                    <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">{`Assess "${a.inputSummary}" with policy context, customer history, fraud signals. Return score + explanation.`}</pre>
                  </div>
                  <div className="ai-panel rounded-xl bg-muted/50 p-3">
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Full response</div>
                    <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">{`{
  "output": "${a.outputSummary}",
  "confidence": ${a.confidence},
  "override": ${a.humanOverride}
}`}</pre>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
