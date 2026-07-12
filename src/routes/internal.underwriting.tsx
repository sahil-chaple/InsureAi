import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { X } from "lucide-react";
import { Badge, Button, Card, AIPanel, Input, Modal } from "@/components/ui-kit";
import { mockApplications } from "@/data/mock";
import { fmtINR } from "@/lib/format";
import { toast } from "sonner";
import { requireAuth } from "@/components/ProtectedRoute";

export const Route = createFileRoute("/internal/underwriting")({
  component: UnderwritingPage,
  beforeLoad: requireAuth(["underwriter", "admin"]),
});

function UnderwritingPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [override, setOverride] = useState("");
  const [confirm, setConfirm] = useState<null | "approve" | "reject">(null);
  const open = mockApplications.find((a) => a.id === openId);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Policy Applications</h1>
      <p className="mb-6 text-sm text-muted-foreground">AI-assessed applications awaiting your decision.</p>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Application</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Coverage</th>
                <th className="px-4 py-3">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {mockApplications.map((a) => (
                <tr key={a.id} onClick={() => setOpenId(a.id)} className="cursor-pointer border-t hover:bg-secondary/40">
                  <td className="px-4 py-3 font-mono text-xs">{a.id}</td>
                  <td className="px-4 py-3 font-medium">{a.customer}</td>
                  <td className="px-4 py-3">{a.type}</td>
                  <td className="px-4 py-3">{fmtINR(a.coverage)}</td>
                  <td className="px-4 py-3"><Badge tone={a.riskScore < 40 ? "success" : a.riskScore < 70 ? "warning" : "danger"}>{a.riskScore}/100</Badge></td>
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
              <AIPanel title={`AI Risk Assessment — Score ${open.riskScore}/100`}>
                <div className="mt-2">
                  <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Key factors</div>
                  <ul className="space-y-1.5">
                    {open.factors.map((f) => <li key={f} className="flex gap-2">• {f}</li>)}
                  </ul>
                  <div className="mt-3 rounded-lg bg-white p-3">
                    <div className="text-xs font-semibold text-primary">Recommended premium range</div>
                    <div className="font-bold">{open.recommended}</div>
                  </div>
                </div>
              </AIPanel>

              <div>
                <Input label="Override premium (₹)" placeholder="Leave blank to accept AI recommendation" value={override} onChange={(e) => setOverride(e.target.value)} />
              </div>
            </div>
            <footer className="flex gap-2 border-t p-4">
              <Button className="flex-1" onClick={() => setConfirm("approve")}>Approve</Button>
              <Button variant="secondary" className="flex-1" onClick={() => toast.info("More info requested")}>Request more info</Button>
              <Button variant="danger" onClick={() => setConfirm("reject")}>Reject</Button>
            </footer>
          </div>
        </div>
      )}

      <Modal open={confirm !== null} onClose={() => setConfirm(null)} title={`${confirm === "approve" ? "Approve" : "Reject"} application?`}
        footer={<><Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button><Button onClick={() => { toast.success(confirm === "approve" ? "Application approved" : "Application rejected"); setConfirm(null); setOpenId(null); }}>Confirm</Button></>}>
        <p>This decision is final and will be recorded in the audit log.</p>
      </Modal>
    </div>
  );
}
