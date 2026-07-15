/** Indian currency: ₹X,XX,XXX */
export function fmtINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

/** Date format: 15 Jan 2025 */
export function fmtDate(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
