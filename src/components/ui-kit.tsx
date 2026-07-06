import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Check, Sparkles } from "lucide-react";
import insureaiLogo from "@/assets/insureai-logo.png.asset.json";

export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function Logo({ className = "", size = 32, showText: _showText }: { className?: string; size?: number; showText?: boolean }) {
  return (
    <span className={cn("inline-flex items-center", className)} aria-label="InsureAI">
      <img src={insureaiLogo.url} alt="InsureAI — Intelligent Protection" style={{ height: size, width: "auto" }} className="block" />
    </span>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = "primary", size = "md", loading, leftIcon, rightIcon, className, children, disabled, ...p },
  ref,
) {
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-base" }[size];
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "ai-gradient-bg text-white hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(79,70,229,0.35)]",
    secondary: "bg-white text-primary border-[1.5px] border-primary hover:bg-secondary",
    ghost: "text-primary hover:bg-secondary",
    danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
  }[variant];
  return (
    <button ref={ref} disabled={disabled || loading} className={cn(base, sizes, styles, className)} {...p}>
      {loading ? <Spinner size={16} /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

export function Spinner({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={cn("animate-spin", className)} fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Card({ className, children, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("card-base p-5", className)} {...p}>{children}</div>;
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; hint?: string };
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, className, id, ...p }, ref) {
  const inputId = id || p.name;
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          "w-full rounded-xl border-[1.5px] bg-white px-4 py-3 text-sm outline-none transition-all",
          "placeholder:text-muted-foreground",
          error ? "border-danger focus:border-danger focus:ring-[3px] focus:ring-red-100" : "border-border focus:border-primary focus:ring-[3px] focus:ring-[rgba(79,70,229,0.15)]",
          className,
        )}
        {...p}
      />
      {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
});

type TAProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string };
export const Textarea = forwardRef<HTMLTextAreaElement, TAProps>(function Textarea({ label, error, className, id, ...p }, ref) {
  return (
    <div className="w-full">
      {label && <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "w-full rounded-xl border-[1.5px] border-border bg-white px-4 py-3 text-sm outline-none transition-all focus:border-primary focus:ring-[3px] focus:ring-[rgba(79,70,229,0.15)]",
          className,
        )}
        {...p}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
});

export function Badge({ tone = "neutral", children, className }: { tone?: "neutral" | "success" | "warning" | "danger" | "info" | "ai"; children: ReactNode; className?: string }) {
  const styles = {
    neutral: "bg-gray-100 text-gray-700",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-red-50 text-red-700",
    info: "bg-indigo-50 text-indigo-700",
    ai: "ai-gradient-bg text-white",
  }[tone];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold", styles, className)}>{children}</span>;
}

export function AIBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full ai-gradient-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white", className)}>
      <Sparkles size={10} /> AI
    </span>
  );
}

export function AIPanel({ children, title, className }: { children: ReactNode; title?: string; className?: string }) {
  return (
    <div className={cn("ai-panel", className)}>
      <div className="absolute right-3 top-3"><AIBadge /></div>
      {title && <div className="mb-2 pr-14 text-sm font-semibold text-primary">{title}</div>}
      <div className="pr-14 text-sm text-foreground/90">{children}</div>
    </div>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all",
                done ? "ai-gradient-bg text-white" : active ? "bg-white text-primary ring-2 ring-primary" : "bg-gray-200 text-gray-500",
              )}
            >
              {done ? <Check size={14} /> : i + 1}
            </div>
            <div className={cn("hidden md:block truncate text-xs font-medium", active ? "text-primary" : "text-muted-foreground")}>{s}</div>
            {i < steps.length - 1 && <div className={cn("h-px flex-1 min-w-4", done ? "bg-primary" : "bg-border")} />}
          </div>
        );
      })}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function Chip({ selected, onClick, children }: { selected?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
        selected ? "border-primary bg-secondary text-primary" : "border-border bg-white text-foreground hover:border-primary/50",
      )}
    >
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3">
      <span
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "ai-gradient-bg" : "bg-gray-300",
        )}
      >
        <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform", checked ? "translate-x-5" : "translate-x-0.5")} />
      </span>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}

export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; footer?: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in-0" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl page-enter" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="mb-3 text-lg font-semibold">{title}</h3>}
        <div className="text-sm text-foreground/90">{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: React.ComponentType<{ size?: number; className?: string }>; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/60 py-16 px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Icon size={28} className="text-primary" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
