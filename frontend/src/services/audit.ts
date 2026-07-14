import { mockAuditLog, type AuditEntry } from "@/data/mockData";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function getAuditLog(): Promise<AuditEntry[]> {
  await sleep(700);
  return mockAuditLog;
}

export function filterAuditLog(
  entries: AuditEntry[],
  filters: { search?: string; actor?: string; eventType?: string; dateFrom?: string; dateTo?: string }
): AuditEntry[] {
  return entries.filter((e) => {
    // search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match = 
        e.eventId.toLowerCase().includes(q) ||
        e.actor.toLowerCase().includes(q) ||
        e.eventType.toLowerCase().includes(q) ||
        e.entity.toLowerCase().includes(q) ||
        e.result.toLowerCase().includes(q);
      if (!match) return false;
    }

    // actor filter
    if (filters.actor && filters.actor !== "all" && e.actor !== filters.actor) {
      return false;
    }

    // eventType filter
    if (filters.eventType && filters.eventType !== "all" && e.eventType !== filters.eventType) {
      return false;
    }

    // dateFrom filter
    if (filters.dateFrom) {
      const entryDate = new Date(e.timestamp);
      const fromDate = new Date(filters.dateFrom);
      if (entryDate < fromDate) return false;
    }

    // dateTo filter
    if (filters.dateTo) {
      const entryDate = new Date(e.timestamp);
      const toDate = new Date(filters.dateTo);
      // Add one day to toDate to make it inclusive
      toDate.setDate(toDate.getDate() + 1);
      if (entryDate > toDate) return false;
    }

    return true;
  });
}

export function exportAuditCsv(entries: AuditEntry[]): string {
  const header = "Event ID,Timestamp,Actor,Event Type,Entity,IP,Result\n";
  const rows = entries
    .map(
      (e) =>
        `"${e.eventId}","${e.timestamp}","${e.actor}","${e.eventType}","${e.entity}","${e.ip}","${e.result}"`
    )
    .join("\n");
  return header + rows;
}
