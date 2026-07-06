import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LineChart, ShieldCheck, ClipboardList, Sparkles, Check, X } from "lucide-react";
import { Card, Badge, AIBadge } from "@/components/ui-kit";
import { mockAgentActivity } from "@/data/mock";

export const Route = createFileRoute("/internal/admin")({ component: AdminPage });

function AdminPage() {
  const [tab, setTab] = useState<"overview" | "agents" | "queue" | "users">("overview");

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Admin</h1>
      <p className="mb-6 text-sm text-muted-foreground">Platform overview, AI transparency, and user management.</p>

      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
        {([["overview", "Overview"], ["agents", "AI Transparency"], ["queue", "Review Queue"], ["users", "Users"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === k ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>{l}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={ShieldCheck} label="Total policies" value="12,483" hint="+184 this week" />
          <Stat icon={ClipboardList} label="Active claims" value="207" hint="24 flagged" />
          <Stat icon={LineChart} label="Revenue (MTD)" value="₹4.2 Cr" hint="+18% vs last month" />
          <Stat icon={Sparkles} label="AI decisions today" value="1,048" hint="96% autonomous" />
        </div>
      )}

      {tab === "agents" && (
        <div className="space-y-5">
          <Card>
            <div className="mb-4 flex items-center gap-2">
              <AIBadge />
              <h3 className="font-semibold">AI decisions — last 7 days</h3>
            </div>
            <MiniChart />
          </Card>
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Agent</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Confidence</th>
                    <th className="px-4 py-3">Input</th>
                    <th className="px-4 py-3">Output</th>
                    <th className="px-4 py-3">Override</th>
                    <th className="px-4 py-3">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {mockAgentActivity.map((a) => (
                    <tr key={a.time + a.agent} className="border-t">
                      <td className="px-4 py-3 font-medium">{a.agent}</td>
                      <td className="px-4 py-3">{a.action}</td>
                      <td className="px-4 py-3"><Badge tone={a.confidence >= 0.9 ? "success" : a.confidence >= 0.8 ? "info" : "warning"}>{(a.confidence * 100).toFixed(0)}%</Badge></td>
                      <td className="px-4 py-3 text-muted-foreground">{a.input}</td>
                      <td className="px-4 py-3">{a.output}</td>
                      <td className="px-4 py-3">{a.override ? <Check size={14} className="text-primary" /> : <X size={14} className="text-muted-foreground" />}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{a.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {tab === "queue" && (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 text-sm font-semibold">Manual review queue (AI-deferred)</div>
          <ul className="divide-y">
            {["APP-2024-3340 · Complex medical history", "CLM-2024-88420 · High fraud score", "APP-2024-3320 · Coverage exceeds threshold"].map((r, i) => (
              <li key={r} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{r}</span>
                <Badge tone={i === 0 ? "warning" : i === 1 ? "danger" : "info"}>{i === 0 ? "In review" : i === 1 ? "Escalated" : "Resolved"}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "users" && (
        <Card className="p-0 overflow-hidden">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody>
              {[
                { n: "Priya Reviewer", e: "priya@insureai.com", r: "Claims Reviewer", s: "Active" },
                { n: "Rahul Underwriter", e: "rahul@insureai.com", r: "Underwriter", s: "Active" },
                { n: "Vikram Auditor", e: "vikram@insureai.com", r: "Auditor", s: "Active" },
                { n: "Ananya Sinha", e: "ananya@insureai.com", r: "Admin", s: "Invited" },
              ].map((u) => (
                <tr key={u.e} className="border-t">
                  <td className="px-4 py-3 font-medium">{u.n}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.e}</td>
                  <td className="px-4 py-3">{u.r}</td>
                  <td className="px-4 py-3"><Badge tone={u.s === "Active" ? "success" : "warning"}>{u.s}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, hint }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string; hint: string }) {
  return (
    <Card>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary"><Icon size={18} /></div>
      <div className="text-xs font-semibold uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </Card>
  );
}

function MiniChart() {
  const data = [120, 165, 210, 180, 240, 195, 260];
  const max = Math.max(...data);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div>
      <div className="flex h-40 items-end gap-3">
        {data.map((v, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t-lg ai-gradient-bg transition-all hover:opacity-80" style={{ height: `${(v / max) * 100}%` }} />
            <div className="text-xs text-muted-foreground">{days[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
