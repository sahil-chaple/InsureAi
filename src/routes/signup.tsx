import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button, Input, Logo } from "@/components/ui-kit";
import { signup } from "@/services/auth";
import { useAuthStore } from "@/store/auth";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Enter your name";
    if (!form.email.trim()) e.email = "Enter your email";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.password) e.password = "Enter a password";
    else if (form.password.length < 6) e.password = "At least 6 characters";
    if (form.confirm !== form.password) e.confirm = "Passwords don't match";
    if (!terms) e.terms = "Accept the terms to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const user = await signup(form.name, form.email);
      login(user);
      toast.success("Account created — let's build your profile.");
      navigate({ to: "/onboarding" });
    } finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-[480px] page-enter">
        <Link to="/" className="mb-6 flex items-center justify-center gap-1.5 text-xl font-bold">
          <Logo />
        </Link>
        <div className="card-base p-7">
          <h1 className="mb-1 text-2xl font-bold">Create your account</h1>
          <p className="mb-6 text-sm text-muted-foreground">Start with a personalized quote in minutes.</p>

          <div className="space-y-2">
            <button type="button" className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold hover:bg-muted" onClick={() => toast.info("Google sign-up UI only")}>
              <span className="text-lg">🇬</span> Continue with Google
            </button>
            <button type="button" className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold hover:bg-muted" onClick={() => toast.info("Apple sign-up UI only")}>
              <span className="text-lg"></span> Continue with Apple
            </button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or sign up with email <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} />
            <Input label="Confirm password" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} error={errors.confirm} />

            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5" />
              <span className="text-muted-foreground">I agree to the <a className="text-primary">Terms of Service</a> and <a className="text-primary">Privacy Policy</a>.</span>
            </label>
            {errors.terms && <p className="text-xs text-danger">{errors.terms}</p>}

            <Button type="submit" loading={busy} className="w-full">Create Account</Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
