import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { AIBadge, Badge, Button } from "@/components/ui-kit";
import { getChatResponse, getSeededChatHistory } from "@/services/ai";
import { useAuthStore } from "@/store/auth";
import { useAssistantQueueStore } from "@/store/assistantQueue";
import { toast } from "sonner";
import type { ChatResponse } from "@/services/ai";

export const Route = createFileRoute("/dashboard/assistant")({ component: AssistantPage });

type Msg =
  | { role: "user"; text: string }
  | { role: "ai"; text: string; citations?: ChatResponse["citations"]; confidence?: number };

function AssistantPage() {
  const user = useAuthStore((s) => s.user);
  const addFlagged = useAssistantQueueStore((s) => s.addFlagged);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const seeded = getSeededChatHistory();
    setMsgs(
      seeded.map((m) =>
        m.role === "ai"
          ? { role: "ai" as const, text: m.text, citations: m.citations, confidence: m.confidence }
          : { role: "user" as const, text: m.text },
      ),
    );
  }, []);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    const r = await getChatResponse(q);
    setMsgs((m) => [
      ...m,
      { role: "ai", text: r.text, citations: r.citations, confidence: r.confidence },
    ]);
    if (r.flagged) {
      addFlagged(q);
      toast.info("Your question has been flagged for review");
    }
    setBusy(false);
  }

  const suggestions = [
    "What does my policy cover?",
    "How do I file a claim?",
    "When is my next premium due?",
    "Should I add a top-up?",
  ];

  return (
    <div className="mx-auto flex h-[calc(100dvh-8rem)] max-w-3xl flex-col">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full ai-gradient-bg text-white">
          <Sparkles size={18} />
        </div>
        <div>
          <h1 className="font-bold">AI Assistant</h1>
          <p className="text-xs text-muted-foreground">
            Hi {user?.name?.split(" ")[0] || "there"}! Trained on your policies & preferences
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-border/60 bg-white p-5">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            {m.role === "ai" ? (
              <div className="ai-panel relative max-w-[85%]">
                <div className="absolute right-2 top-2">
                  <AIBadge />
                </div>
                <div className="mb-1 text-xs font-semibold text-primary">Customer Assistant</div>
                <div className="pr-12 text-sm">{m.text}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {m.confidence && (
                    <Badge tone="info">{m.confidence}% confidence</Badge>
                  )}
                  {m.citations?.map((c) => (
                    <span
                      key={c.doc}
                      className="rounded-full border border-primary/30 bg-secondary px-2 py-0.5 text-[10px] font-medium text-primary"
                    >
                      {c.label}: {c.doc}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="max-w-[80%] rounded-2xl bg-primary px-4 py-2.5 text-sm text-white">{m.text}</div>
            )}
          </div>
        ))}
        {busy && (
          <div className="ai-panel max-w-[70%]">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <span className="inline-flex gap-1">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
              </span>
              thinking…
            </div>
          </div>
        )}
      </div>

      {msgs.length <= 6 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium hover:border-primary hover:bg-secondary"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-3 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your policy…"
          className="flex-1 rounded-xl border-[1.5px] border-border bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-[rgba(79,70,229,0.15)]"
        />
        <Button type="submit" loading={busy}>
          <Send size={14} />
        </Button>
      </form>
    </div>
  );
}
