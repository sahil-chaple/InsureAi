import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Edit2 } from "lucide-react";
import { Button, Input, Stepper, Chip, Toggle, Logo } from "@/components/ui-kit";
import { useOnboarding } from "@/store/onboarding";

export const Route = createFileRoute("/onboarding/")({ component: OnboardingPage });

const STEPS = ["Personal", "Health", "Assets", "Insurance", "Review"];
const CONDITIONS = ["Diabetes", "Hypertension", "Heart Disease", "Asthma", "None", "Other"];
const FAMILY = ["Diabetes", "Cancer", "Heart Disease", "Stroke", "None"];
const EXISTING_POLICIES = ["Health", "Motor", "Life", "Travel", "Home", "None"];
const REASONS = ["Better coverage", "Cheaper premium", "First time", "Employer requirement", "Family protection", "Investment"];

function toggle<T>(arr: T[] | undefined, item: T): T[] {
  const a = arr || [];
  return a.includes(item) ? a.filter((x) => x !== item) : [...a, item];
}

function OnboardingPage() {
  const navigate = useNavigate();
  const data = useOnboarding((s) => s.data);
  const step = useOnboarding((s) => s.step);
  const set = useOnboarding((s) => s.set);
  const setStep = useOnboarding((s) => s.setStep);

  function next() {
    if (step < 4) setStep(step + 1);
    else navigate({ to: "/onboarding/analyzing" });
  }
  function back() { if (step > 0) setStep(step - 1); }

  return (
    <div className="min-h-dvh bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-center gap-1.5 text-lg font-bold">
          <Logo />
        </div>
        <div className="card-base p-6 sm:p-8">
          <div className="mb-6">
            <Stepper steps={STEPS} current={step} />
          </div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Step {step + 1} of 5</div>
          <h1 className="mb-6 text-2xl font-bold">{["Personal Information", "Health Profile", "Assets & Lifestyle", "Insurance History", "Review Profile"][step]}</h1>

          {step === 0 && <Step1 data={data} set={set} />}
          {step === 1 && <Step2 data={data} set={set} />}
          {step === 2 && <Step3 data={data} set={set} />}
          {step === 3 && <Step4 data={data} set={set} />}
          {step === 4 && <Step5 data={data} goto={(i) => setStep(i)} />}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button variant="secondary" onClick={back} disabled={step === 0} leftIcon={<ArrowLeft size={14} />}>Back</Button>
            <Button onClick={next} rightIcon={step < 4 ? <ArrowRight size={14} /> : undefined}>
              {step < 4 ? "Continue" : "Analyze My Profile ✦"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1({ data, set }: { data: any; set: (p: any) => void }) {
  return (
    <div className="space-y-4">
      <Input label="Date of Birth" type="date" value={data.dob || ""} onChange={(e) => set({ dob: e.target.value })} />
      <div>
        <label className="mb-2 block text-sm font-medium">Gender</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {["Male", "Female", "Other", "Prefer not to say"].map((g) => (
            <Chip key={g} selected={data.gender === g} onClick={() => set({ gender: g })}>{g}</Chip>
          ))}
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Marital Status</label>
        <select className="w-full rounded-xl border-[1.5px] border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary" value={data.marital || ""} onChange={(e) => set({ marital: e.target.value })}>
          <option value="">Select…</option>
          {["Single", "Married", "Divorced", "Widowed"].map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>
      <Input label="Occupation" placeholder="e.g. Software Engineer" value={data.occupation || ""} onChange={(e) => set({ occupation: e.target.value })} />
      <div>
        <label className="mb-1.5 block text-sm font-medium">Annual Income: <span className="font-bold text-primary">{data.income ? `₹${(data.income / 100000).toFixed(1)}L` : "₹0"}</span></label>
        <input type="range" min={0} max={5000000} step={50000} value={data.income || 0} onChange={(e) => set({ income: +e.target.value })} className="w-full accent-primary" />
        <div className="flex justify-between text-xs text-muted-foreground"><span>₹0</span><span>₹50L+</span></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="City" value={data.city || ""} onChange={(e) => set({ city: e.target.value })} />
        <Input label="State" value={data.state || ""} onChange={(e) => set({ state: e.target.value })} />
      </div>
    </div>
  );
}

function Step2({ data, set }: { data: any; set: (p: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Height (cm)" type="number" value={data.heightCm || ""} onChange={(e) => set({ heightCm: +e.target.value })} />
        <Input label="Weight (kg)" type="number" value={data.weightKg || ""} onChange={(e) => set({ weightKg: +e.target.value })} />
      </div>
      <div className="flex flex-wrap gap-6 pt-2">
        <Toggle checked={!!data.smoker} onChange={(v) => set({ smoker: v })} label="I smoke" />
        <Toggle checked={!!data.drinks} onChange={(v) => set({ drinks: v })} label="I drink alcohol" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Pre-existing conditions</label>
        <div className="flex flex-wrap gap-2">{CONDITIONS.map((c) => <Chip key={c} selected={data.conditions?.includes(c)} onClick={() => set({ conditions: toggle(data.conditions, c) })}>{c}</Chip>)}</div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium">Family medical history</label>
        <div className="flex flex-wrap gap-2">{FAMILY.map((c) => <Chip key={c} selected={data.familyHistory?.includes(c)} onClick={() => set({ familyHistory: toggle(data.familyHistory, c) })}>{c}</Chip>)}</div>
      </div>
    </div>
  );
}

function Step3({ data, set }: { data: any; set: (p: any) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <Toggle checked={!!data.ownsVehicle} onChange={(v) => set({ ownsVehicle: v })} label="I own a vehicle" />
        {data.ownsVehicle && (
          <div className="mt-3 grid gap-3 rounded-xl bg-muted/50 p-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Vehicle type</label>
              <select value={data.vehicleType || ""} onChange={(e) => set({ vehicleType: e.target.value })} className="w-full rounded-xl border-[1.5px] border-border bg-white px-3 py-2.5 text-sm">
                <option value="">Select…</option>
                {["Hatchback", "Sedan", "SUV", "Two-wheeler"].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <Input label="Registration year" type="number" value={data.vehicleYear || ""} onChange={(e) => set({ vehicleYear: +e.target.value })} />
            <Input label="Vehicle value (₹)" type="number" value={data.vehicleValue || ""} onChange={(e) => set({ vehicleValue: +e.target.value })} />
          </div>
        )}
      </div>
      <div>
        <Toggle checked={!!data.ownsHome} onChange={(v) => set({ ownsHome: v })} label="I own a home" />
        {data.ownsHome && (
          <div className="mt-3 grid gap-3 rounded-xl bg-muted/50 p-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Property type</label>
              <select value={data.propertyType || ""} onChange={(e) => set({ propertyType: e.target.value })} className="w-full rounded-xl border-[1.5px] border-border bg-white px-3 py-2.5 text-sm">
                <option value="">Select…</option>
                {["Apartment", "Independent house", "Villa"].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <Input label="Estimated value (₹)" type="number" value={data.propertyValue || ""} onChange={(e) => set({ propertyValue: +e.target.value })} />
          </div>
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">Travel frequency</label>
        <select value={data.travelFreq || ""} onChange={(e) => set({ travelFreq: e.target.value })} className="w-full rounded-xl border-[1.5px] border-border bg-white px-4 py-3 text-sm">
          <option value="">Select…</option>
          {["Rarely", "Occasionally", "Frequently", "Very frequently (international)"].map((v) => <option key={v}>{v}</option>)}
        </select>
      </div>
    </div>
  );
}

function Step4({ data, set }: { data: any; set: (p: any) => void }) {
  return (
    <div className="space-y-5">
      <Toggle checked={!!data.currentlyInsured} onChange={(v) => set({ currentlyInsured: v })} label="I currently have insurance" />
      <div>
        <label className="mb-2 block text-sm font-medium">Existing policies</label>
        <div className="flex flex-wrap gap-2">{EXISTING_POLICIES.map((p) => <Chip key={p} selected={data.existingPolicies?.includes(p)} onClick={() => set({ existingPolicies: toggle(data.existingPolicies, p) })}>{p}</Chip>)}</div>
      </div>
      <Toggle checked={!!data.priorClaims} onChange={(v) => set({ priorClaims: v })} label="I've filed a claim in the last 3 years" />
      {data.priorClaims && <Input label="Approximate claim amount (₹)" type="number" value={data.priorClaimAmount || ""} onChange={(e) => set({ priorClaimAmount: +e.target.value })} />}
      <div>
        <label className="mb-2 block text-sm font-medium">Why are you looking for insurance?</label>
        <div className="flex flex-wrap gap-2">{REASONS.map((r) => <Chip key={r} selected={data.reasons?.includes(r)} onClick={() => set({ reasons: toggle(data.reasons, r) })}>{r}</Chip>)}</div>
      </div>
    </div>
  );
}

function Step5({ data, goto }: { data: any; goto: (i: number) => void }) {
  const sections = [
    { i: 0, title: "Personal", rows: [["DOB", data.dob], ["Gender", data.gender], ["Marital", data.marital], ["Occupation", data.occupation], ["Income", data.income ? `₹${(data.income / 100000).toFixed(1)}L` : "-"], ["Location", [data.city, data.state].filter(Boolean).join(", ") || "-"]] },
    { i: 1, title: "Health", rows: [["Height / Weight", `${data.heightCm || "-"} cm / ${data.weightKg || "-"} kg`], ["Smoker", data.smoker ? "Yes" : "No"], ["Drinks", data.drinks ? "Yes" : "No"], ["Conditions", (data.conditions || []).join(", ") || "None"], ["Family history", (data.familyHistory || []).join(", ") || "None"]] },
    { i: 2, title: "Assets", rows: [["Vehicle", data.ownsVehicle ? `${data.vehicleType || "-"} (${data.vehicleYear || "-"})` : "No"], ["Home", data.ownsHome ? data.propertyType || "-" : "No"], ["Travel", data.travelFreq || "-"]] },
    { i: 3, title: "Insurance", rows: [["Currently insured", data.currentlyInsured ? "Yes" : "No"], ["Existing", (data.existingPolicies || []).join(", ") || "None"], ["Prior claims", data.priorClaims ? "Yes" : "No"], ["Reasons", (data.reasons || []).join(", ") || "-"]] },
  ];
  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <div key={s.i} className="rounded-2xl border border-border bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">{s.title}</h3>
            <button onClick={() => goto(s.i)} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"><Edit2 size={12} /> Edit</button>
          </div>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            {s.rows.map(([k, v]) => (
              <div key={k as string} className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium">{v || "-"}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
