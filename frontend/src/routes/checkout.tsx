import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, CreditCard, ShieldCheck, Check, Sparkles } from "lucide-react";
import { Button, Input, Card, Modal, Logo } from "@/components/ui-kit";
import { usePolicyStore } from "@/store/policy";
import { fmtINR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

const TABS = ["Card", "UPI", "Net Banking", "EMI"] as const;
type Tab = (typeof TABS)[number];
const BANKS = ["HDFC", "ICICI", "SBI", "Axis", "Kotak", "Yes", "IDFC", "PNB"];

function CheckoutPage() {
  const navigate = useNavigate();
  const selectedPlan = usePolicyStore((s) => s.selectedPlan);
  const [tab, setTab] = useState<Tab>("Card");
  const [card, setCard] = useState({ num: "", name: "", exp: "", cvv: "" });
  const [upi, setUpi] = useState("");
  const [emi, setEmi] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState<null | 0 | 1 | 2>(null);

  if (!selectedPlan) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="card-base p-8 text-center">
          <h1 className="mb-2 text-xl font-bold">No plan selected</h1>
          <p className="mb-6 text-sm text-muted-foreground">Choose a plan from recommendations first.</p>
          <Button onClick={() => navigate({ to: "/recommendations" })}>Browse plans</Button>
        </div>
      </div>
    );
  }

  const plan = selectedPlan;
  const base = plan.premium;
  const gst = Math.round(base * 0.18);
  const total = base + gst;

  function formatCardNum(v: string) {
    return v
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  }

  function detectBrand(n: string) {
    const d = n.replace(/\s/g, "");
    if (d.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(d)) return "Mastercard";
    if (/^6/.test(d)) return "RuPay";
    return "";
  }

  useEffect(() => {
    if (processing === null) return;
    const t = setTimeout(() => {
      if (processing < 2) setProcessing((processing + 1) as 1 | 2);
      else {
        setProcessing(null);
        setConfirmOpen(false);
        toast.success("Payment confirmed");
        navigate({ to: "/verification" });
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [processing, navigate]);

  return (
    <div className="min-h-dvh bg-background pb-16">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-1.5 font-bold">
            <Logo />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Lock size={12} /> Secure checkout
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-3 page-enter">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h1 className="mb-1 text-2xl font-bold">Payment</h1>
            <p className="mb-6 text-sm text-muted-foreground">All transactions are encrypted and PCI-DSS compliant.</p>
            <div className="mb-6 flex flex-wrap gap-1 rounded-xl bg-muted p-1">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`min-w-[80px] flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                    tab === t ? "bg-white text-primary shadow-sm" : "text-muted-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {tab === "Card" && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Card number</label>
                  <div className="relative">
                    <input
                      value={card.num}
                      onChange={(e) => setCard({ ...card, num: formatCardNum(e.target.value) })}
                      placeholder="1234 5678 9012 3456"
                      className="w-full rounded-xl border-[1.5px] border-border bg-white px-4 py-3 pr-24 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(79,70,229,0.15)]"
                    />
                    {detectBrand(card.num) && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-primary">
                        {detectBrand(card.num)}
                      </span>
                    )}
                  </div>
                </div>
                <Input label="Name on card" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Expiry (MM/YY)"
                    placeholder="12/28"
                    value={card.exp}
                    onChange={(e) => setCard({ ...card, exp: e.target.value })}
                  />
                  <Input
                    label="CVV"
                    type="password"
                    maxLength={4}
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                  />
                </div>
              </div>
            )}

            {tab === "UPI" && (
              <div className="flex gap-2">
                <Input label="UPI ID" placeholder="name@upi" value={upi} onChange={(e) => setUpi(e.target.value)} className="flex-1" />
                <div className="pt-6">
                  <Button variant="secondary">Verify</Button>
                </div>
              </div>
            )}

            {tab === "Net Banking" && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {BANKS.map((b) => (
                  <button
                    key={b}
                    className="rounded-xl border border-border bg-white p-4 text-sm font-semibold hover:border-primary hover:bg-secondary"
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}

            {tab === "EMI" && (
              <div className="space-y-2">
                {[3, 6, 9, 12].map((m) => (
                  <button
                    key={m}
                    onClick={() => setEmi(m)}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      emi === m ? "border-primary bg-secondary" : "border-border bg-white hover:border-primary/50"
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{m} months</div>
                      <div className="text-xs text-muted-foreground">No cost EMI available</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {fmtINR(Math.round(total / m))}
                        <span className="text-xs font-normal text-muted-foreground">/mo</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <Button className="mt-6 w-full" size="lg" leftIcon={<Lock size={16} />} onClick={() => setConfirmOpen(true)}>
              Pay Securely — {fmtINR(total)}
            </Button>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck size={12} /> 256-bit SSL
              </span>
              <span className="flex items-center gap-1">
                <CreditCard size={12} /> PCI-DSS Compliant
              </span>
              <span className="flex items-center gap-1">
                <Check size={12} /> IRDAI Regulated
              </span>
            </div>
          </Card>
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-6">
          <Card>
            <h3 className="mb-4 font-semibold">Order Summary</h3>
            <div className="mb-4 rounded-xl bg-muted/50 p-3">
              <div className="text-xs font-semibold uppercase text-muted-foreground">{plan.provider}</div>
              <div className="text-sm font-bold">{plan.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Coverage: {fmtINR(plan.coverage)} · Term: {plan.term}
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>Base premium</dt>
                <dd>{fmtINR(base)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>GST (18%)</dt>
                <dd>{fmtINR(gst)}</dd>
              </div>
              <div className="my-2 border-t" />
              <div className="flex justify-between font-bold">
                <dt>Total</dt>
                <dd>{fmtINR(total)}</dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2">
              <input placeholder="Coupon code" className="flex-1 rounded-xl border-[1.5px] border-border px-3 py-2 text-sm" />
              <Button size="sm" variant="secondary">
                Apply
              </Button>
            </div>
          </Card>

          <div className="rounded-2xl border border-primary/20 bg-[#FAFAFE] p-5">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Sparkles size={14} />
              <span className="text-xs font-bold uppercase tracking-wider">InsureAI Promise</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-success" /> Instant policy issuance
              </li>
              <li className="flex gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-success" /> Free cancellation within 15 days
              </li>
              <li className="flex gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-success" /> 24/7 claim support
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <Modal
        open={confirmOpen && processing === null}
        onClose={() => setConfirmOpen(false)}
        title="Confirm payment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setProcessing(0)}>Pay {fmtINR(total)}</Button>
          </>
        }
      >
        <p>
          You'll be charged <b>{fmtINR(total)}</b> for <b>{plan.name}</b>. This is a one-time premium; auto-renewal is
          off by default.
        </p>
      </Modal>

      {processing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="card-base w-full max-w-md p-6 page-enter">
            <div className="mb-4 flex items-center gap-2 text-primary">
              <Sparkles size={16} />
              <span className="font-semibold">Processing payment</span>
            </div>
            {["Initiating secure payment…", "Verifying transaction…", "Payment confirmed"].map((s, i) => (
              <div key={s} className="mb-2 flex items-center gap-3 text-sm">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    i <= processing ? "ai-gradient-bg text-white" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < processing || (i === 2 && processing === 2) ? (
                    <Check size={12} />
                  ) : i === processing ? (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                  ) : (
                    ""
                  )}
                </div>
                <span className={i <= processing ? "font-medium" : "text-muted-foreground"}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
