import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { AIBadge, Button, Spinner } from "@/components/ui-kit";
import { askAssistant } from "@/services/ai";

export const Route = createFileRoute("/dashboard/assistant")({ component: AssistantPage });

function AssistantPage() {
  const [msgs, setMsgs] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hi Arjun! I have access to your active policy and can answer questions about coverage, claims, or renewals. What would you like to know?" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    const r = await askAssistant(q);
    setMsgs((m) => [...m, { role: "ai", text: r }]);
    setBusy(false);
  }

  const suggestions = ["What does my policy cover?", "How do I file a claim?", "When is my next premium due?", "Should I add a top-up?"];

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-3xl flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full ai-gradient-bg text-white"><Sparkles size={18} /></div>
        <div>
          <h1 className="font-bold">AI Assistant</h1>
          <p className="text-xs text-muted-foreground">Trained on your policies & preferences</p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-white p-5 border border-border/60">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            {m.role === "ai" ? (
              <div className="ai-panel max-w-[85%]">
                <div className="absolute right-2 top-2"><AIBadge /></div>
                <div className="pr-12 text-sm">{m.text}</div>
              </div>
            ) : (
              <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-white">{m.text}</div>
            )}
          </div>
        ))}
        {busy && <div className="ai-panel max-w-[70%] flex items-center gap-2 text-sm text-muted-foreground"><Spinner size={14} /> thinking…</div>}
      </div>

      {msgs.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => { setInput(s); }} className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium hover:border-primary hover:bg-secondary">{s}</button>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your policy…" className="flex-1 rounded-xl border-[1.5px] border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(79,70,229,0.15)]" />
        <Button type="submit" loading={busy}><Send size={14} /></Button>
      </form>
    </div>
  );
}
