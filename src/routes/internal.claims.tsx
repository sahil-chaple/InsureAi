import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X, Check, AlertTriangle, Sparkles, FileText } from "lucide-react";
import { Badge, Button, Card, AIPanel, Modal } from "@/components/ui-kit";
import { mockClaimsQueue } from "@/data/mock";
import { fmtINR } from "@/data/plans";
import { toast } from "sonner";

export const Route = createFileRoute("/internal/claims")({ component: ClaimsReviewerPage });

function ClaimsReviewerPage() {
  const [tab, setTab] = useState<"queue" | "fraud">("queue");
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<null | "approve" | "escalate">(null);
  const open = mockClaimsQueue.find((c) => c.id === openId);

  const rows = tab === "fraud" ? [...mockClaimsQueue].sort((a, b) => b.fraudScore - a.fraudScore).filter((c) => c.fraudScore >= 40) : mockClaimsQueue;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Claims Queue</h1>
          <p className="text-sm text-muted-foreground">Review, approve, or escalate submitted claims.</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          {(["queue", "fraud"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${tab === t ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}>
              {t === "queue" ? "All claims" : "Fraud alerts"}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Claim ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Fraud Score</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} onClick={() => setOpenId(c.id)} className="cursor-pointer border-t hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                  <td className="px-4 py-3 font-medium">{c.customer}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3">{fmtINR(c.amount)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.submitted}</td>
                  <td className="px-4 py-3"><Badge tone={c.fraudLevel === "Low" ? "success" : c.fraudLevel === "Medium" ? "warning" : "danger"}>{c.fraudScore} · {c.fraudLevel}</Badge></td>
                  <td className="px-4 py-3"><Badge tone={c.status === "Approved" ? "success" : "warning"}>{c.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <div className="fixed inset-0 z-50 flex bg-black/40" onClick={() => setOpenId(null)}>
          <div className="ml-auto flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl page-enter" onClick={(e) => e.stopPropagation()}>
            <header className="flex items-center justify-between border-b p-5">
              <div>
                <div className="text-xs text-muted-foreground">{open.id}</div>
                <h3 className="text-lg font-bold">{open.customer} · {open.type}</h3>
              </div>
              <button onClick={() => setOpenId(null)} className="rounded-lg p-2 hover:bg-muted"><X size={18} /></button>
            </header>
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/50 p-4 text-sm">
                <div><div className="text-xs text-muted-foreground">Amount claimed</div><div className="font-bold">{fmtINR(open.amount)}</div></div>
                <div><div className="text-xs text-muted-foreground">Submitted</div><div className="font-bold">{open.submitted}</div></div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Documents</h4>
                {["Hospital bill.pdf", "Discharge summary.pdf", "Diagnostic reports.pdf"].map((d) => (
                  <a key={d} className="mb-2 flex items-center gap-2 rounded-xl border border-border p-3 text-sm hover:border-primary">
                    <FileText size={14} className="text-primary" /> {d}
                  </a>
                ))}
              </div>

              <AIPanel title={`AI Assessment — Fraud score ${open.fraudScore} (${open.fraudLevel})`}>
                <div className="mt-2 space-y-2">
                  {open.flags.map((f) => (
                    <div key={f} className="flex gap-2">
                      {open.fraudLevel === "High" ? <AlertTriangle size={14} className="mt-0.5 text-danger shrink-0" /> : <Check size={14} className="mt-0.5 text-success shrink-0" />}
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </AIPanel>
            </div>
            <footer className="flex flex-wrap gap-2 border-t p-4">
              <Button
                onClick={() => setConfirm("approve")}
                disabled={open.fraudLevel === "High"}
                title={open.fraudLevel === "High" ? "Senior reviewer sign-off required for high-risk claims." : undefined}
                className="flex-1"
              >Approve</Button>
              <Button variant="secondary" className="flex-1" onClick={() => toast.info("Info request sent")}>Request Info</Button>
              <Button variant="danger" onClick={() => setConfirm("escalate")}>Escalate</Button>
            </footer>
          </div>
        </div>
      )}

      <Modal open={confirm !== null} onClose={() => setConfirm(null)}
        title={confirm === "approve" ? "Approve claim?" : "Escalate claim?"}
        footer={<><Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button><Button onClick={() => { toast.success(confirm === "approve" ? "Claim approved" : "Claim escalated"); setConfirm(null); setOpenId(null); }}>Confirm</Button></>}>
        <p>This action is logged in the audit trail and cannot be undone from this view.</p>
      </Modal>
    </div>
  );
}
