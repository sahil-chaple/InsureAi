import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { User, ClipboardList, LineChart, ShieldAlert, ScrollText } from "lucide-react";
import { Button, Input, Logo } from "@/components/ui-kit";
import { login as loginSvc, demoLogin } from "@/services/auth";
import { useAuthStore, roleHome, type Role } from "@/store/auth";

export const Route = createFileRoute("/login")({ component: LoginPage });

const roleTiles: { role: Role; label: string; desc: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { role: "customer", label: "Customer", desc: "Explore plans, buy policies, file claims", icon: User },
  { role: "claims_reviewer", label: "Claims Reviewer", desc: "Review claims queue with AI fraud scores", icon: ClipboardList },
  { role: "underwriter", label: "Underwriter", desc: "Assess applications & set premiums", icon: ShieldAlert },
  { role: "admin", label: "Admin", desc: "Oversight + AI transparency dashboard", icon: LineChart },
  { role: "auditor", label: "Auditor", desc: "Immutable audit log + AI decision trail", icon: ScrollText },
];

function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState<Role | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!form.email) err.email = "Enter your email";
    if (!form.password) err.password = "Enter your password";
    setErrors(err);
    if (Object.keys(err).length) return;
    setBusy(true);
    try {
      const u = await loginSvc(form.email);
      login(u);
      toast.success(`Welcome back, ${u.name}`);
      navigate({ to: "/dashboard" });
    } finally { setBusy(false); }
  }

  async function onDemo(role: Role) {
    setDemoBusy(role);
    try {
      const u = await demoLogin(role);
      login(u);
      toast.success(`Logged in as ${role.replace("_", " ")}`);
      navigate({ to: roleHome(role) });
    } finally { setDemoBusy(null); }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-[520px] page-enter">
        <Link to="/" className="mb-6 flex items-center justify-center gap-1.5 text-xl font-bold">
          <Logo />
        </Link>
        <div className="card-base p-7">
          <h1 className="mb-1 text-2xl font-bold">Welcome back</h1>
          <p className="mb-6 text-sm text-muted-foreground">Log in to your InsureAI account.</p>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
            <div>
              <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
              <div className="mt-1.5 text-right">
                <a className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
              </div>
            </div>
            <Button type="submit" loading={busy} className="w-full">Log In</Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary">Sign Up</Link>
          </p>
        </div>

        <div className="mt-6 card-base p-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="ai-gradient-text text-lg">✦</span>
            <h2 className="font-semibold">Demo Login</h2>
          </div>
          <p className="mb-4 text-xs text-muted-foreground">Instantly explore any role — no signup needed.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {roleTiles.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.role}
                  onClick={() => onDemo(t.role)}
                  disabled={demoBusy !== null}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md disabled:opacity-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary group-hover:ai-gradient-bg group-hover:text-white">
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
