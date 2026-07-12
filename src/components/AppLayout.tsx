import { Logo } from "@/components/ui-kit";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, ShieldCheck, FilePlus2, Files, Sparkles, Settings, LogOut, Menu, ClipboardList, LineChart, ShieldAlert, ScrollText, X } from "lucide-react";
import { useState } from "react";
import { AIAssistant } from "./AIAssistant";
import { useAuthStore, type Role } from "@/store/auth";
import { cn } from "./ui-kit";

type NavItem = { to: string; label: string; icon: React.ComponentType<{ size?: number }> };

const customerNav: NavItem[] = [
  { to: "/dashboard", label: "Overview", icon: Home },
  { to: "/dashboard/policies", label: "My Policies", icon: ShieldCheck },
  { to: "/dashboard/claims/new", label: "File a Claim", icon: FilePlus2 },
  { to: "/dashboard/documents", label: "Documents", icon: Files },
  { to: "/dashboard/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

const internalNav: Record<Exclude<Role, "customer">, NavItem[]> = {
  claims_reviewer: [
    { to: "/internal/claims", label: "Claims Queue", icon: ClipboardList },
    { to: "/internal/claims?tab=fraud", label: "Fraud Alerts", icon: ShieldAlert },
  ],
  underwriter: [
    { to: "/internal/underwriting", label: "Applications", icon: ClipboardList },
  ],
  admin: [
    { to: "/internal/admin", label: "Overview", icon: LineChart },
    { to: "/internal/admin?tab=agents", label: "AI Transparency", icon: Sparkles },
    { to: "/internal/admin?tab=queue", label: "Review Queue", icon: ClipboardList },
  ],
  auditor: [
    { to: "/internal/audit", label: "Audit Log", icon: ScrollText },
    { to: "/internal/audit?tab=ai", label: "AI Decisions", icon: Sparkles },
  ],
};

export function AppLayout({ children, variant }: { children: ReactNode; variant: "customer" | "internal" }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [openMobile, setOpenMobile] = useState(false);

  const nav: NavItem[] = variant === "customer"
    ? customerNav
    : user && user.role !== "customer" ? internalNav[user.role] : [];

  const roleLabel: Record<Role, string> = {
    customer: "Customer",
    claims_reviewer: "Claims Reviewer",
    underwriter: "Underwriter",
    admin: "Admin",
    auditor: "Auditor",
  };

  function onLogout() {
    logout();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Top bar (mobile) */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-white/80 backdrop-blur px-4 py-3 sm:hidden">
        <Link to="/dashboard" className="flex items-center gap-1.5 font-bold">
          <Logo />
        </Link>
        <button onClick={() => setOpenMobile(true)} aria-label="Menu" className="rounded-lg p-2 hover:bg-muted"><Menu size={20} /></button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden sm:flex sticky top-0 h-dvh w-64 shrink-0 flex-col border-r bg-white">
          <div className="border-b px-6 py-5">
            <Link to="/" className="flex items-center gap-1.5 text-lg font-bold">
              <Logo />
            </Link>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {nav.map((n) => {
              const active = path === n.to.split("?")[0];
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to.split("?")[0]}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-secondary text-primary" : "text-foreground/80 hover:bg-muted",
                  )}
                >
                  <Icon size={18} />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t p-3">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full ai-gradient-bg text-sm font-semibold text-white">
                {user?.avatarInitials ?? user?.name?.[0] ?? "U"}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{user?.name}</div>
                <div className="truncate text-xs text-muted-foreground">{user ? roleLabel[user.role] : ""}</div>
              </div>
            </div>
            <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
              <LogOut size={16} /> Log out
            </button>
          </div>
        </aside>

        {/* Mobile drawer */}
        {openMobile && (
          <div className="fixed inset-0 z-40 bg-black/40 sm:hidden" onClick={() => setOpenMobile(false)}>
            <div className="h-full w-72 bg-white p-4" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-bold"><Logo /></span>
                <button onClick={() => setOpenMobile(false)}><X size={20} /></button>
              </div>
              {nav.map((n) => {
                const Icon = n.icon;
                return (
                  <Link key={n.to} to={n.to.split("?")[0]} onClick={() => setOpenMobile(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted">
                    <Icon size={18} /> {n.label}
                  </Link>
                );
              })}
              <button onClick={onLogout} className="mt-4 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
                <LogOut size={16} /> Log out
              </button>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="min-w-0 flex-1 pb-24 sm:pb-8">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8 page-enter">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white sm:hidden">
        <div className="grid grid-cols-5 gap-1 p-2">
          {nav.slice(0, 5).map((n) => {
            const active = path === n.to.split("?")[0];
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to.split("?")[0]} className={cn("flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium", active ? "text-primary" : "text-muted-foreground")}>
                <Icon size={18} />
                <span className="truncate">{n.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {variant === "customer" && <AIAssistant />}
    </div>
  );
}
