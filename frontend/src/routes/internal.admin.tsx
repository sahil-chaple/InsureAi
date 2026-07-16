import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, Fragment } from "react";
import { LineChart, ShieldCheck, ClipboardList, Sparkles, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { Card, Badge, AIBadge, Skeleton } from "@/components/ui-kit";
import { getAgentActivity } from "@/services/ai";
import { useAuthStore } from "@/store/auth";
import { useAssistantQueueStore } from "@/store/assistantQueue";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { requireAuth } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/internal/admin")({
  component: AdminPage,
  beforeLoad: requireAuth(["admin"]),
});

const AGENT_TYPES = [
  "Customer Assistant",
  "Document Verification",
  "Policy Recommendation",
  "Claims Assessment",
  "Fraud Detection",
  "Underwriting",
] as const;

function generateChartData() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => {
    const row: Record<string, string | number> = { day };
    AGENT_TYPES.forEach((agent, j) => {
      row[agent] = Math.floor(15 + ((i + 1) * (j + 3) * 7) % 45);
    });
    return row;
  });
}

function AdminPage() {
  const [tab, setTab] = useState<"overview" | "agents" | "queue" | "users">("overview");
  const [expanded, setExpanded] = useState<string | null>(null);
  const role = useAuthStore((s) => s.user?.role);
  const flaggedMessages = useAssistantQueueStore((s) => s.flaggedMessages);

  const { data: activity = [], isLoading, isError, error } = useQuery({
    queryKey: ["agentActivity"],
    queryFn: getAgentActivity,
  });

  const chartData = useMemo(() => generateChartData(), []);

  const stats = useMemo(() => {
    const total = activity.length;
    const escalated = activity.filter((a) => a.humanOverride).length;
    const avgConfidence = total ? Math.round(activity.reduce((s, a) => s + a.confidence, 0) / total) : 0;
    const flagged = activity.filter((a) => a.confidence < 85).length + flaggedMessages.length;
    return { total, escalated, avgConfidence, flagged };
  }, [activity, flaggedMessages.length]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/5 p-6 text-danger">
        <h2 className="mb-2 text-lg font-bold">Access Denied or Server Error</h2>
        <p className="text-sm">{(error as Error)?.message || "Failed to load admin telemetry dashboard."}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">AI Transparency Dashboard</h1>
      <p className="mb-6 text-sm text-muted-foreground">Platform overview, AI transparency, and user management.</p>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {(
          [
            ["overview", "Overview"],
            ["agents", "AI Transparency"],
            ["queue", "Review Queue"],
            ["users", "Users"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ${
              tab === k ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Sparkles} label="Total AI decisions" value={String(stats.total)} hint="Last 24 hours" />
          <Stat icon={ClipboardList} label="Escalated" value={String(stats.escalated)} hint="Human overrides" />
          <Stat icon={LineChart} label="Avg confidence" value={`${stats.avgConfidence}%`} hint="Across all agents" />
          <Stat icon={ShieldCheck} label="Flagged" value={String(stats.flagged)} hint="Low confidence + chat queue" />
        </div>
      )}

      {tab === "agents" && (
        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <AIBadge />
              <h3 className="font-semibold">AI decisions by agent — last 7 days</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {AGENT_TYPES.map((agent, i) => (
                    <Bar
                      key={agent}
                      dataKey={agent}
                      fill={["#4F46E5", "#7C3AED", "#6366F1", "#8B5CF6", "#A78BFA", "#C4B5FD"][i]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 w-8" />
                    <th className="px-4 py-3">Agent</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Confidence</th>
                    <th className="px-4 py-3">Override</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.map((a) => {
                    const isOpen = expanded === a.id;
                    const isAuditor = role === "auditor";
                    return (
                      <Fragment key={a.id}>
                        <tr
                          className="cursor-pointer border-t hover:bg-secondary/30"
                          onClick={() => setExpanded(isOpen ? null : a.id)}
                        >
                          <td className="px-4 py-3">
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </td>
                          <td className="px-4 py-3 font-medium">{a.agentName}</td>
                          <td className="px-4 py-3">{a.action}</td>
                          <td className="px-4 py-3">
                            <Badge tone={a.confidence >= 90 ? "success" : a.confidence >= 80 ? "info" : "warning"}>
                              {a.confidence}%
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            {a.humanOverride ? (
                              <Check size={14} className="text-primary" />
                            ) : (
                              <X size={14} className="text-muted-foreground" />
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{a.timestamp}</td>
                        </tr>
                        {isOpen && (
                          <tr className="border-t bg-muted/20">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="ai-panel">
                                  <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Input</div>
                                  <p className="text-sm">
                                    {isAuditor ? a.inputSummary : a.inputSummary.slice(0, 80) + (a.inputSummary.length > 80 ? "…" : "")}
                                  </p>
                                </div>
                                <div className="ai-panel">
                                  <div className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Output</div>
                                  <p className="text-sm">
                                    {isAuditor ? a.outputSummary : a.outputSummary.slice(0, 80) + (a.outputSummary.length > 80 ? "…" : "")}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === "queue" && (
        <Card className="overflow-hidden p-0">
          <div className="p-4 text-sm font-semibold">Manual review queue (AI-deferred)</div>
          <ul className="divide-y">
            {[
              ...flaggedMessages.map((m) => ({ label: `Chat: "${m.question.slice(0, 50)}…"`, tone: "info" as const, status: "Flagged" })),
              { label: "CLM-2024-00501 · High fraud score", tone: "danger" as const, status: "Escalated" },
              { label: "APP-2024-3340 · Complex medical history", tone: "warning" as const, status: "In review" },
            ].map((r) => (
              <li key={r.label} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{r.label}</span>
                <Badge tone={r.tone}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "users" && (
        <Card className="overflow-hidden p-0">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { n: "Priya Reviewer", e: "priya@insureai.com", r: "Claims Reviewer", s: "Active" },
                { n: "Rahul Underwriter", e: "rahul@insureai.com", r: "Underwriter", s: "Active" },
                { n: "Vikram Auditor", e: "vikram@insureai.com", r: "Auditor", s: "Active" },
                { n: "Neha Admin", e: "neha@insureai.com", r: "Admin", s: "Active" },
              ].map((u) => (
                <tr key={u.e} className="border-t">
                  <td className="px-4 py-3 font-medium">{u.n}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.e}</td>
                  <td className="px-4 py-3">{u.r}</td>
                  <td className="px-4 py-3">
                    <Badge tone={u.s === "Active" ? "success" : "warning"}>{u.s}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon size={18} />
      </div>
      <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </Card>
  );
}
