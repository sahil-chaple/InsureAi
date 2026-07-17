import type { AuditEntry } from "@/data/mockData";
import { apiClient } from "./apiClient";
import { mockGetAuditLog } from "./mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === "true";

interface AuditLogOutBackend {
  id: string;
  timestamp: string;
  actor_id?: string;
  actor_label: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  ip_address?: string;
  result: string;
}

export async function getAuditLog(): Promise<AuditEntry[]> {
  if (USE_MOCK) return mockGetAuditLog();

  try {
    const logs = await apiClient<AuditLogOutBackend[]>("admin/audit-log");
    return logs.map((log) => ({
      eventId: log.id.slice(0, 10).toUpperCase(),
      timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString("en-US", { hour12: false }) : "Recently",
      actor: log.actor_label,
      eventType: log.action,
      entity: log.entity_id ? `${log.entity_type}:${log.entity_id.slice(0, 8)}` : log.entity_type,
      ip: log.ip_address || "127.0.0.1",
      result: log.result,
    }));
  } catch {
    return mockGetAuditLog();
  }
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
