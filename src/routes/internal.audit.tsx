import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Filter } from "lucide-react";
import { Card, Button, Badge, Input, AIBadge } from "@/components/ui-kit";
import { mockAuditLog, mockAgentActivity } from "@/data/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/internal/audit")({ component: AuditPage });

function AuditPage() {
  const [tab, setTab] = useState<"log" | "ai">("log");
  const [q, setQ] = useState("");
  const rows = mockAuditLog.filter((r) => !q || Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Audit</h1>
          <p className="text-sm text-muted-foreground">Immutable log of every action across the platform.</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          <button onClick={() => setTab("log")} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === "log" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>Audit log</button>
          <button onClick={() => setTab("ai")} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === "ai" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>AI decisions</button>
        </div>
      </div>

      {tab === "log" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <div className="flex-1 min-w-[240px]"><Input placeholder="Search actor, event, entity…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <Button variant="secondary" leftIcon={<Filter size={14} />}>Filter</Button>
            <Button variant="secondary" leftIcon={<Download size={14} />} onClick={() => toast.success("Audit log exported (CSV)")}>Export CSV</Button>
          </div>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm font-mono">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground font-sans">
                  <tr>
                    <th className="px-4 py-3">Event ID</th>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">IP</th>
                    <th className="px-4 py-3">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.eventId} className="border-t">
                      <td className="px-4 py-3 text-xs">{r.eventId}</td>
                      <td className="px-4 py-3 text-xs">{r.ts}</td>
                      <td className="px-4 py-3 text-xs">{r.actor}</td>
                      <td className="px-4 py-3 text-xs">{r.action}</td>
                      <td className="px-4 py-3 text-xs">{r.entity}</td>
                      <td className="px-4 py-3 text-xs">{r.ip}</td>
                      <td className="px-4 py-3"><Badge tone="success">{r.result}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {tab === "ai" && (
        <div className="space-y-4">
          {mockAgentActivity.map((a, i) => (
            <Card key={i}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AIBadge />
                  <h4 className="font-semibold">{a.agent} — {a.action}</h4>
                </div>
                <div className="text-xs text-muted-foreground">{a.time}</div>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Full prompt</div>
                  <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">{`Assess "${a.input}" with policy context, customer history, fraud signals. Return score + explanation.`}</pre>
                </div>
                <div className="rounded-xl bg-muted/50 p-3">
                  <div className="text-xs font-semibold uppercase text-muted-foreground">Full response</div>
                  <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">{`{
  "output": "${a.output}",
  "confidence": ${a.confidence},
  "override": ${a.override}
}`}</pre>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
