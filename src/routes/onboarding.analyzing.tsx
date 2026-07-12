import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { useOnboarding } from "@/store/onboarding";
import { analyzeUserProfile } from "@/services/ai";

export const Route = createFileRoute("/onboarding/analyzing")({ component: AnalyzingPage });

const STEPS = [
  "Analyzing personal profile",
  "Assessing health risk factors",
  "Evaluating asset exposure",
  "Scanning 200+ insurance products",
  "Calculating personalized risk score",
  "Generating recommendations",
];

function AnalyzingPage() {
  const navigate = useNavigate();
  const profileData = useOnboarding((s) => s.profileData);
  const setRiskProfile = useOnboarding((s) => s.setRiskProfile);
  const [done, setDone] = useState(0);

  useEffect(() => {
    analyzeUserProfile(profileData).then(setRiskProfile);
  }, [profileData, setRiskProfile]);

  useEffect(() => {
    const timers: number[] = [];
    for (let i = 0; i < STEPS.length; i++) {
      timers.push(window.setTimeout(() => setDone(i + 1), (i + 1) * 1000));
    }
    timers.push(window.setTimeout(() => navigate({ to: "/recommendations" }), STEPS.length * 1000 + 800));
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full ai-gradient-bg opacity-20 blur-2xl animate-pulse" />
        <div className="relative flex h-28 w-28 items-center justify-center rounded-full ai-gradient-bg text-white shadow-[0_12px_40px_rgba(79,70,229,0.4)]">
          <Sparkles size={44} className="animate-pulse" />
        </div>
        <span
          className="absolute -inset-2 rounded-full border-2 border-primary/40"
          style={{ animation: "ping-slow 2s ease-out infinite" }}
        />
      </div>
      <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Our AI is working for you</h1>
      <p className="mb-8 text-sm text-muted-foreground">This usually takes about 6 seconds.</p>

      <ul className="w-full max-w-md space-y-2">
        {STEPS.map((s, i) => {
          const active = i === done;
          const complete = i < done;
          return (
            <li
              key={s}
              className={`flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm transition-all ${
                complete ? "border-emerald-200" : active ? "border-primary" : "border-border"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  complete ? "bg-emerald-100 text-emerald-700" : active ? "ai-gradient-bg text-white" : "bg-gray-100 text-gray-400"
                }`}
              >
                {complete ? <Check size={12} /> : active ? <Sparkles size={12} /> : "✦"}
              </span>
              <span className={complete ? "text-foreground" : active ? "font-medium text-foreground" : "text-muted-foreground"}>
                {s}
                {active ? "…" : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
