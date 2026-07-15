import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, Upload, Camera, Sparkles, ShieldCheck } from "lucide-react";
import { Button, AIBadge, Logo } from "@/components/ui-kit";

export const Route = createFileRoute("/verification")({ component: VerificationPage });

const STEP1_STAGES = ["Scanning document…", "Extracting details…", "Verifying authenticity…", "Identity confirmed ✓"];
const STEP2_STAGES = ["Matching with ID document…", "Face verified ✓"];

function VerificationPage() {
  const navigate = useNavigate();
  const [s1, setS1] = useState<-1 | 0 | 1 | 2 | 3>(-1);
  const [s2, setS2] = useState<-1 | 0 | 1>(-1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpDone, setOtpDone] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (s1 === -1 || s1 === 3) return;
    const t = setTimeout(() => setS1(((s1 as number) + 1) as any), 900);
    return () => clearTimeout(t);
  }, [s1]);
  useEffect(() => {
    if (s2 === -1 || s2 === 1) return;
    const t = setTimeout(() => setS2(((s2 as number) + 1) as any), 900);
    return () => clearTimeout(t);
  }, [s2]);
  useEffect(() => {
    if (s1 !== 3) return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [s1, countdown]);

  function onOtpChange(i: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) inputs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) {
      setTimeout(() => { setOtpDone(true); setTimeout(() => navigate({ to: "/policy/issued" }), 1400); }, 400);
    }
  }

  return (
    <div className="min-h-dvh bg-background px-4 py-8">
      <div className="mx-auto max-w-2xl page-enter">
        <div className="mb-6 flex items-center justify-center gap-1.5 text-lg font-bold"><Logo /></div>
        <div className="card-base p-6 sm:p-8">
          <h1 className="mb-2 text-2xl font-bold">Almost there — one last verification step.</h1>
          <p className="mb-8 text-sm text-muted-foreground">For your security, we need to verify your identity before issuing your policy. This takes less than 2 minutes.</p>

          <div className="space-y-6">
            <StepBox n={1} title="Aadhaar / ID Verification" done={s1 === 3} active={s1 !== 3}>
              {s1 === -1 ? (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 p-8 text-center hover:border-primary hover:bg-secondary/40">
                  <Upload size={24} className="mb-2 text-primary" />
                  <div className="text-sm font-medium">Upload your Aadhaar or ID</div>
                  <div className="text-xs text-muted-foreground">JPG / PNG / PDF · Max 5MB</div>
                  <input type="file" className="hidden" onChange={() => setS1(0)} />
                </label>
              ) : (
                <div className="rounded-2xl bg-[#FAFAFE] border-l-[3px] border-primary p-4 relative">
                  <AIBadge className="absolute right-3 top-3" />
                  {STEP1_STAGES.map((st, i) => {
                    const complete = s1 > i;
                    const active = s1 === i;
                    return (
                      <div key={st} className="mb-1.5 flex items-center gap-2 text-sm last:mb-0">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${complete ? "bg-success text-white" : active ? "ai-gradient-bg text-white" : "bg-muted text-muted-foreground"}`}>
                          {complete ? <Check size={10} /> : active ? "…" : ""}
                        </span>
                        <span className={complete ? "" : active ? "font-medium" : "text-muted-foreground"}>{st}</span>
                      </div>
                    );
                  })}
                  {s1 === 3 && (
                    <div className="mt-4 rounded-xl bg-white p-3 text-sm">
                      <div className="text-xs text-muted-foreground">Extracted</div>
                      <div className="grid gap-1 sm:grid-cols-3 mt-1">
                        <div><span className="text-muted-foreground text-xs">Name</span><div className="font-semibold">Arjun Mehta</div></div>
                        <div><span className="text-muted-foreground text-xs">DOB</span><div className="font-semibold">12 Jun 1992</div></div>
                        <div><span className="text-muted-foreground text-xs">ID</span><div className="font-semibold">XXXX-XXXX-4521</div></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </StepBox>

            <StepBox n={2} title="Selfie Verification" done={s2 === 1} active={s1 === 3 && s2 !== 1} disabled={s1 !== 3}>
              {s1 === 3 && s2 === -1 && (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/40 p-8 text-center hover:border-primary">
                  <div className="mb-3 grid h-24 w-24 place-items-center rounded-full border-4 border-primary/30">
                    <Camera size={28} className="text-primary" />
                  </div>
                  <div className="text-sm font-medium">Capture a selfie</div>
                  <div className="text-xs text-muted-foreground">Face the camera in good light</div>
                  <input type="file" accept="image/*" className="hidden" onChange={() => setS2(0)} />
                </label>
              )}
              {s2 >= 0 && (
                <div className="rounded-2xl bg-[#FAFAFE] border-l-[3px] border-primary p-4 relative">
                  <AIBadge className="absolute right-3 top-3" />
                  {STEP2_STAGES.map((st, i) => {
                    const complete = s2 > i;
                    const active = s2 === i;
                    return (
                      <div key={st} className="mb-1.5 flex items-center gap-2 text-sm">
                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${complete ? "bg-success text-white" : active ? "ai-gradient-bg text-white" : "bg-muted"}`}>{complete ? <Check size={10} /> : ""}</span>
                        <span className={complete ? "" : active ? "font-medium" : "text-muted-foreground"}>{st}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </StepBox>

            <StepBox n={3} title="OTP Confirmation" done={otpDone} active={s2 === 1 && !otpDone} disabled={s2 !== 1}>
              {s2 === 1 && (
                <div>
                  <p className="mb-4 text-sm text-muted-foreground">We've sent a 6-digit OTP to <b className="text-foreground">+91 98XX XX4521</b>.</p>
                  <div className="mb-3 flex justify-center gap-2">
                    {otp.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => { inputs.current[i] = el; }}
                        value={d}
                        onChange={(e) => onOtpChange(i, e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus(); }}
                        inputMode="numeric"
                        maxLength={1}
                        className="h-12 w-11 rounded-xl border-[1.5px] border-border text-center text-lg font-bold outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(79,70,229,0.15)]"
                      />
                    ))}
                  </div>
                  <div className="text-center text-xs text-muted-foreground">
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : <button className="font-medium text-primary hover:underline" onClick={() => setCountdown(30)}>Resend OTP</button>}
                  </div>
                  {otpDone && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-success"><Check size={16} /> OTP verified — issuing your policy…</div>
                  )}
                </div>
              )}
            </StepBox>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck size={12} /> Your data is encrypted end-to-end and never shared.
          </div>
        </div>
      </div>
    </div>
  );
}

function StepBox({ n, title, done, active, disabled, children }: { n: number; title: string; done?: boolean; active?: boolean; disabled?: boolean; children: React.ReactNode }) {
  return (
    <div className={`rounded-2xl border p-5 transition-all ${disabled ? "opacity-50" : ""} ${done ? "border-success/40 bg-emerald-50/40" : active ? "border-primary" : "border-border"}`}>
      <div className="mb-3 flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${done ? "bg-success text-white" : active ? "ai-gradient-bg text-white" : "bg-muted text-muted-foreground"}`}>
          {done ? <Check size={14} /> : n}
        </div>
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
