import { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import { Button, AIBadge, Spinner } from "./ui-kit";
import { getChatResponse } from "@/services/ai";

type Msg = { role: "user" | "ai"; text: string };

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "Hi! I'm your InsureAI assistant. Ask me anything about your policy, claims, or coverage." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    const reply = await getChatResponse(q);
    setMsgs((m) => [...m, { role: "ai", text: reply.text }]);
    setBusy(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI Assistant"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full ai-gradient-bg px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(79,70,229,0.4)] transition-transform hover:-translate-y-0.5"
      >
        <Sparkles size={16} /> Ask AI
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl page-enter"
          >
            <header className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full ai-gradient-bg text-white"><Sparkles size={16} /></div>
                <div>
                  <div className="font-semibold text-sm">InsureAI Assistant</div>
                  <div className="text-xs text-muted-foreground">Powered by AI ✦</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-1.5 hover:bg-muted"><X size={18} /></button>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {msgs.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                  {m.role === "ai" && (
                    <div className="ai-panel max-w-[85%]">
                      <div className="absolute right-2 top-2"><AIBadge /></div>
                      <div className="pr-12 text-sm">{m.text}</div>
                    </div>
                  )}
                  {m.role === "user" && (
                    <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-white">{m.text}</div>
                  )}
                </div>
              ))}
              {busy && <div className="ai-panel max-w-[70%] flex items-center gap-2 text-sm text-muted-foreground"><Spinner size={14} /> thinking…</div>}
            </div>
            <form className="flex items-center gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); send(); }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your policy…"
                className="flex-1 rounded-xl border-[1.5px] border-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(79,70,229,0.15)]"
              />
              <Button type="submit" size="sm" loading={busy} aria-label="Send"><Send size={14} /></Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
