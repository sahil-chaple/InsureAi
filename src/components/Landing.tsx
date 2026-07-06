import { Logo } from "@/components/ui-kit";
import { Link } from "@tanstack/react-router";
import { Sparkles, ShieldCheck, Zap, HeadphonesIcon, Lock, FileCheck, User, Search, Rocket, Check } from "lucide-react";
import { Button, AIBadge } from "./ui-kit";

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex items-center gap-1.5 text-lg font-bold">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-foreground/70 md:flex">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#plans" className="hover:text-foreground">Plans</a>
            <a href="#about" className="hover:text-foreground">About</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="secondary" size="sm">Log In</Button></Link>
            <Link to="/signup"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-primary">
            <Sparkles size={12} /> AI-native insurance platform
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Insurance that <span className="ai-gradient-text">understands you.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            AI-powered recommendations, instant policies, and seamless claims — built for the modern world.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup"><Button size="lg" rightIcon={<Sparkles size={16} />}>Get My Quote</Button></Link>
            <a href="#how"><Button size="lg" variant="secondary">See how it works</Button></a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
            <div>⭐ 4.9/5 · 12,000+ policies</div>
            <div>IRDAI regulated</div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-3xl bg-gradient-to-br from-indigo-100 via-violet-100 to-transparent blur-2xl" />
          <div className="card-base rotate-1 p-6 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">RECOMMENDED FOR ARJUN</span>
              <AIBadge />
            </div>
            <div className="mb-1 text-sm font-medium text-primary">Aegis Complete Care · Elite</div>
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold">₹20L</span>
              <span className="text-sm text-muted-foreground">coverage</span>
            </div>
            <div className="mb-4 space-y-2 text-sm">
              {["Cashless at 8,000+ hospitals", "Zero room-rent cap", "Restore benefit 100%", "Free annual check-up"].map((f) => (
                <div key={f} className="flex items-center gap-2"><Check size={14} className="text-success" /> {f}</div>
              ))}
            </div>
            <div className="mb-4 flex items-center justify-between rounded-xl bg-secondary p-3">
              <span className="text-xs font-medium text-primary">AI Match Score</span>
              <span className="text-lg font-bold text-primary">96%</span>
            </div>
            <Button className="w-full">Select Plan</Button>
          </div>
          <div className="absolute -bottom-6 -left-4 card-base -rotate-3 p-4 shadow-lg max-w-[220px]">
            <div className="flex items-center gap-2 text-xs font-medium">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Policy issued in 58s
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">Get covered in three steps</h2>
          <p className="mt-3 text-muted-foreground">From profile to policy in under 5 minutes.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: User, title: "1. Build your profile", desc: "Answer a few questions about your health, assets, and needs." },
            { icon: Search, title: "2. AI finds your best plan", desc: "Our AI scans 200+ products and ranks them for you." },
            { icon: Rocket, title: "3. Get covered instantly", desc: "Pay, verify, and receive your policy in under 60 seconds." },
          ].map((s) => (
            <div key={s.title} className="card-base p-6 transition-transform hover:-translate-y-0.5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl ai-gradient-bg text-white">
                <s.icon size={22} />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Lock, title: "256-bit encryption" },
            { icon: FileCheck, title: "AI-verified documents" },
            { icon: Zap, title: "Instant policy issuance" },
            { icon: HeadphonesIcon, title: "24/7 claims support" },
          ].map((t) => (
            <div key={t.title} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <t.icon size={18} />
              </div>
              <div className="text-sm font-semibold">{t.title}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="about" className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <ShieldCheck size={40} className="mx-auto mb-4 text-primary" />
        <h2 className="text-3xl font-bold">Built for trust.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Every recommendation, claim decision, and fraud check is transparent. No black boxes — you always see why our AI suggested what it did.
        </p>
        <Link to="/signup" className="mt-8 inline-block"><Button size="lg">Start with a free quote</Button></Link>
      </section>

      <footer className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-8 sm:flex-row sm:px-6">
          <div className="text-sm text-muted-foreground">© 2026 InsureAI. IRDAI regulated.</div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
