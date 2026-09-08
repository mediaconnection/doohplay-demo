type Status = "online" | "offline" | "warning" | "active" | "paused" | "pending" | "verified";

const statusConfig: Record<Status, { label: string; bg: string; text: string; dot: string }> = {
  online: { label: "Online", bg: "#DCFCE7", text: "#15803D", dot: "#22C55E" },
  offline: { label: "Offline", bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444" },
  warning: { label: "Atenção", bg: "#FEF9C3", text: "#854D0E", dot: "#FACC15" },
  active: { label: "Ativo", bg: "#DBEAFE", text: "#1D4ED8", dot: "#2563EB" },
  paused: { label: "Pausado", bg: "#F1F5F9", text: "#475569", dot: "#94A3B8" },
  pending: { label: "Pendente", bg: "#FFF7ED", text: "#C2410C", dot: "#FF6B00" },
  verified: { label: "Verificado", bg: "#E0F2FE", text: "#0369A1", dot: "#00A3FF" },
};

export function StatusBadge({ status, customLabel }: { status: Status; customLabel?: string }) {
  const cfg = statusConfig[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: cfg.dot }} />
      {customLabel || cfg.label}
    </span>
  );
}
