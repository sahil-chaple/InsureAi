import type { PolicyStatus } from "@/data/mockData";

export function policyStatusTone(status: PolicyStatus): "success" | "warning" | "danger" {
  if (status === "active") return "success";
  if (status === "expiring_soon") return "warning";
  return "danger";
}

export function policyStatusLabel(status: PolicyStatus): string {
  if (status === "active") return "Active";
  if (status === "expiring_soon") return "Expiring Soon";
  return "Expired";
}
