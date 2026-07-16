import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download } from "lucide-react";
import { EmptyState, Card, Skeleton } from "@/components/ui-kit";
import { getUserPolicies } from "@/services/policy";
import { fmtDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/documents")({ component: DocsPage });

function DocsPage() {
  const { data: policies = [], isLoading, isError, error } = useQuery({
    queryKey: ["userPolicies"],
    queryFn: getUserPolicies,
  });

  const docs = policies.flatMap((p) =>
    (p.documents || []).map((d) => ({
      name: d.name,
      size: d.size,
      when: fmtDate(p.validFrom),
    })),
  );

  if (isLoading) {
    return (
      <div>
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-danger/30 bg-danger/5 p-6 text-danger">
        <h2 className="mb-2 text-lg font-bold">Failed to load documents</h2>
        <p className="text-sm">{(error as Error)?.message || "Server connection error."}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Documents</h1>
      {docs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          description="Documents from your policies and claims will appear here."
        />
      ) : (
        <Card className="p-0">
          <ul className="divide-y">
            {docs.map((d, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">
                    <FileText size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {d.size} · {d.when}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => toast.success("Document downloaded")}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Download size={16} />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
