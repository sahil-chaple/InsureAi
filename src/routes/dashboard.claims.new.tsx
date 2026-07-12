import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Upload, Check, FileText, Sparkles } from "lucide-react";
import { Button, Input, Textarea, Stepper, AIPanel, Badge, EmptyState, Skeleton } from "@/components/ui-kit";
import { useClaimsStore } from "@/store/claims";
import { getUserPolicies } from "@/services/policy";
import { getClaimResponse } from "@/services/ai";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/claims/new")({ component: NewClaimPage });

const STEPS = ["Policy", "Incident", "Documents", "AI Review", "Done"];

function NewClaimPage() {
  const navigate = useNavigate();
  const submitClaim = useClaimsStore((s) => s.submitClaim);

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ["userPolicies"],
    queryFn: getUserPolicies,
  });

  const [step, setStep] = useState(0);
  const [policyId, setPolicyId] = useState("");
  const [incident, setIncident] = useState({ type: "Hospitalisation", date: "", location: "", desc: "", amount: "" });
  const [files, setFiles] = useState<{ name: string; progress: number; verified: boolean }[]>([]);
  const [ai, setAi] = useState<{ approvalLikelihood: number; notes: string[]; summary: string } | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [claimId, setClaimId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedPolicyId = policyId || policies[0]?.id || "";

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No policy to claim against"
        description="Buy a policy first to file a claim."
        action={
          <Link to="/recommendations">
            <Button>Explore plans</Button>
          </Link>
        }
      />
    );
  }

  function onUpload(list: FileList | null) {
    if (!list) return;
    const items = Array.from(list).map((f) => ({ name: f.name, progress: 0, verified: false }));
    setFiles((prev) => [...prev, ...items]);
    items.forEach((item, idx) => {
      const key = files.length + idx;
      const timer = setInterval(() => {
        setFiles((prev) => {
          const next = [...prev];
          if (!next[key]) {
            clearInterval(timer);
            return prev;
          }
          next[key] = { ...next[key], progress: Math.min(100, next[key].progress + 20) };
          if (next[key].progress >= 100) {
            clearInterval(timer);
            setTimeout(
              () =>
                setFiles((p) => {
                  const n = [...p];
                  if (n[key]) n[key] = { ...n[key], verified: true };
                  return n;
                }),
              800,
            );
          }
          return next;
        });
      }, 250);
    });
  }

  async function runAI() {
    setAiBusy(true);
    const r = await getClaimResponse(incident.desc);
    setAi(r);
    setAiBusy(false);
  }

  async function submit() {
    setSubmitting(true);
    try {
      const c = await submitClaim({
        policyId: selectedPolicyId,
        type: incident.type,
        amount: Number(incident.amount) || 25000,
        description: incident.desc,
      });
      setClaimId(c.id);
      setStep(4);
      toast.success("Claim submitted successfully");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <button
        onClick={() => navigate({ to: "/dashboard" })}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back
      </button>
      <h1 className="mb-6 text-2xl font-bold">File a Claim</h1>
      <div className="card-base p-6 sm:p-8">
        <div className="mb-6">
          <Stepper steps={STEPS} current={step} />
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Policy</label>
              <select
                value={selectedPolicyId}
                onChange={(e) => setPolicyId(e.target.value)}
                className="w-full rounded-xl border-[1.5px] border-border bg-white px-4 py-3 text-sm"
              >
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.planName} · {p.policyNumber}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Incident type</label>
              <select
                value={incident.type}
                onChange={(e) => setIncident({ ...incident, type: e.target.value })}
                className="w-full rounded-xl border-[1.5px] border-border bg-white px-4 py-3 text-sm"
              >
                {["Hospitalisation", "Accident", "Theft", "Damage", "Loss", "Other"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Incident date"
              type="date"
              value={incident.date}
              onChange={(e) => setIncident({ ...incident, date: e.target.value })}
            />
            <Input
              label="Location"
              placeholder="City, hospital, etc."
              value={incident.location}
              onChange={(e) => setIncident({ ...incident, location: e.target.value })}
            />
            <Input
              label="Claim amount (₹)"
              type="number"
              placeholder="45000"
              value={incident.amount}
              onChange={(e) => setIncident({ ...incident, amount: e.target.value })}
            />
            <Textarea
              label="Describe what happened"
              rows={5}
              value={incident.desc}
              onChange={(e) => setIncident({ ...incident, desc: e.target.value })}
            />
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 p-8 text-center hover:border-primary">
              <Upload size={24} className="mb-2 text-primary" />
              <div className="text-sm font-medium">Drag & drop or click to upload</div>
              <div className="text-xs text-muted-foreground">Receipts, reports, photos — multiple files supported</div>
              <input type="file" multiple className="hidden" onChange={(e) => onUpload(e.target.files)} />
            </label>
            <div className="mt-4 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="rounded-xl border border-border p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 truncate">
                      <FileText size={14} className="text-primary shrink-0" />
                      {f.name}
                    </span>
                    {f.verified ? (
                      <Badge tone="success">
                        <Sparkles size={10} /> AI Verified
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">{f.progress}%</span>
                    )}
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full ai-gradient-bg transition-all" style={{ width: `${f.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            {!ai ? (
              <div className="py-8 text-center">
                <Button loading={aiBusy} onClick={runAI} leftIcon={<Sparkles size={14} />}>
                  Run AI pre-assessment
                </Button>
              </div>
            ) : (
              <AIPanel title={`Approval likelihood: ${ai.approvalLikelihood}%`}>
                <p className="mb-3 text-sm">{ai.summary}</p>
                <ul className="mt-2 space-y-1.5">
                  {ai.notes.map((n) => (
                    <li key={n} className="flex gap-2">
                      <Check size={14} className="mt-0.5 text-success shrink-0" />
                      {n}
                    </li>
                  ))}
                </ul>
              </AIPanel>
            )}
          </div>
        )}

        {step === 4 && claimId && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10 scale-pulse">
              <Check size={32} className="text-success" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Claim submitted</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Claim ID: <b className="text-foreground">{claimId}</b>
            </p>
            <div className="mx-auto max-w-md text-left">
              <Stepper steps={["Submitted", "In Review", "Decision", "Paid"]} current={1} />
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0 || step === 4}
            leftIcon={<ArrowLeft size={14} />}
          >
            Back
          </Button>
          {step < 3 && (
            <Button onClick={() => setStep(step + 1)} rightIcon={<ArrowRight size={14} />}>
              Continue
            </Button>
          )}
          {step === 3 && ai && (
            <Button loading={submitting} onClick={submit}>
              Submit claim
            </Button>
          )}
          {step === 4 && (
            <Button onClick={() => navigate({ to: "/dashboard" })}>Back to dashboard</Button>
          )}
        </div>
      </div>
    </div>
  );
}
