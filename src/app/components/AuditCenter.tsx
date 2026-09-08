import { useState } from "react";
import {
  ArrowLeft, Shield, FileText, Download, CheckCircle2, AlertCircle,
  Clock, Hash, Link2, Globe, Lock, Award, BarChart2, RefreshCw,
  Calendar, Eye, ChevronRight, ExternalLink, Database
} from "lucide-react";

const v = {
  bg: "#020817", card: "#071126", border: "rgba(255,255,255,0.08)",
  text: "#F1F5F9", sub: "#94A3B8", muted: "#475569",
  primary: "#2563EB", success: "#22C55E", warning: "#F59E0B", danger: "#EF4444",
};

interface Props { onBack: () => void; }

const certificates = [
  { id: "CERT-2026-084721", campaign: "Samsung Q4 2026", issuer: "ICP Brasil A3", issued: "2026-06-01", expires: "2027-06-01", status: "valid", hash: "0x9b4c...f21a", trust: 99 },
  { id: "CERT-2026-084720", campaign: "Bradesco Black Nov", issuer: "ICP Brasil A3", issued: "2026-05-28", expires: "2027-05-28", status: "valid", hash: "0x3d8f...b09c", trust: 98 },
  { id: "CERT-2026-084719", campaign: "iFood SP Metro", issuer: "ICP Brasil A3", issued: "2026-05-25", expires: "2027-05-25", status: "valid", hash: "0x7a2e...c34d", trust: 97 },
  { id: "CERT-2026-084718", campaign: "Natura Natal", issuer: "ICP Brasil A3", issued: "2026-05-20", expires: "2027-05-20", status: "valid", hash: "0x1f5b...e87f", trust: 99 },
  { id: "CERT-2026-084717", campaign: "Nescafé Summer", issuer: "ICP Brasil A3", issued: "2026-05-15", expires: "2027-05-15", status: "expiring", hash: "0x6c9d...a12b", trust: 96 },
];

const reports = [
  { name: "Relatório Mensal — Junho 2026", type: "PDF", size: "2.4 MB", generated: "2026-06-07 23:59", period: "Jun/2026", status: "ready" },
  { name: "Relatório de Campanhas Q2 2026", type: "PDF", size: "4.8 MB", generated: "2026-06-01 00:05", period: "Q2/2026", status: "ready" },
  { name: "Auditoria Blockchain — Maio 2026", type: "PDF", size: "1.9 MB", generated: "2026-05-31 23:59", period: "Mai/2026", status: "ready" },
  { name: "Relatório de Trust Score — Q1 2026", type: "PDF", size: "3.1 MB", generated: "2026-03-31 23:59", period: "Q1/2026", status: "ready" },
  { name: "Relatório LGPD Anual 2025", type: "PDF", size: "5.2 MB", generated: "2025-12-31 23:59", period: "2025", status: "ready" },
];

const compliance = [
  {
    name: "LGPD", status: "compliant", score: 100, icon: Shield, color: v.success,
    items: ["Consentimento registrado", "Dados anonimizados", "DPO designado", "Política publicada"],
  },
  {
    name: "ICP Brasil A3", status: "compliant", score: 100, icon: Award, color: "#8B5CF6",
    items: ["Certificado válido", "Assinatura digital ativa", "Timestamp auditável", "Cadeia de confiança"],
  },
  {
    name: "Blockchain Ethereum", status: "compliant", score: 99.9, icon: Database, color: v.primary,
    items: ["Ancoragem verificada", "Hashes imutáveis", "Explorer público", "Contratos auditados"],
  },
  {
    name: "ISO 27001", status: "in_progress", score: 87, icon: Lock, color: v.warning,
    items: ["Política de segurança ✓", "Controle de acesso ✓", "Gestão de incidentes ✓", "Auditoria interna pendente"],
  },
];

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-[20px] ${className}`}
      style={{ background: v.card, border: `1px solid ${v.border}`, boxShadow: "0 12px 40px rgba(0,0,0,0.18)" }}>
      {children}
    </div>
  );
}

export default function AuditCenter({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState<"compliance" | "certificates" | "reports">("compliance");

  return (
    <div className="min-h-screen" style={{ background: v.bg, fontFamily: "'Inter', sans-serif" }}>
      <header className="border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md"
        style={{ borderColor: v.border, background: `${v.bg}e0` }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: v.sub }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="w-px h-5" style={{ background: v.border }} />
          <div>
            <p className="text-xs font-medium" style={{ color: v.sub }}>DOOHPLAY</p>
            <h1 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Audit Center</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: "#22C55E15", color: "#22C55E", border: "1px solid #22C55E30" }}>
            <CheckCircle2 size={11} /> Compliance OK
          </div>
        </div>
      </header>

      <div className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Certificados emitidos", value: "4.847", icon: Award, color: "#8B5CF6" },
            { label: "Relatórios gerados", value: "184", icon: FileText, color: v.primary },
            { label: "Exportações PDF", value: "1.247", icon: Download, color: v.warning },
            { label: "Compliance Score", value: "97.3%", icon: Shield, color: v.success },
          ].map((s, i) => (
            <Card key={i} className="p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}20` }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-[11px]" style={{ color: v.sub }}>{s.label}</p>
                <p className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "'Inter Tight', sans-serif" }}>{s.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: v.card, border: `1px solid ${v.border}` }}>
          {(["compliance", "certificates", "reports"] as const).map((id) => {
            const labels: Record<string,string> = { compliance: "Compliance", certificates: "Certificados", reports: "Relatórios" };
            return (
              <button key={id} onClick={() => setActiveTab(id)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                style={activeTab === id ? { background: v.primary, color: "#fff" } : { color: v.sub }}>
                {labels[id]}
              </button>
            );
          })}
        </div>

        {activeTab === "compliance" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {compliance.map((c, i) => {
              const circ = 2 * Math.PI * 28;
              const offset = circ - (c.score / 100) * circ;
              return (
                <Card key={i} className="p-6">
                  <div className="flex items-start gap-5 mb-5">
                    <div className="relative flex-shrink-0" style={{ width: 72, height: 72 }}>
                      <svg width={72} height={72} style={{ transform: "rotate(-90deg)" }}>
                        <circle cx={36} cy={36} r={28} fill="none" stroke={v.border} strokeWidth={6} />
                        <circle cx={36} cy={36} r={28} fill="none" stroke={c.color} strokeWidth={6}
                          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-extrabold" style={{ color: c.color }}>{c.score}%</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>{c.name}</h3>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${c.status === "compliant" ? "text-[#22C55E]" : "text-[#F59E0B]"}`}
                          style={{ background: c.status === "compliant" ? "#22C55E15" : "#F59E0B15" }}>
                          {c.status === "compliant" ? "Conforme" : "Em andamento"}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "#020817" }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.score}%`, background: c.color }} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {c.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm" style={{ color: v.sub }}>
                        <CheckCircle2 size={13} style={{ color: c.status === "compliant" ? c.color : (item.includes("✓") ? v.success : v.muted) }} />
                        <span>{item.replace(" ✓", "")}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "certificates" && (
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: v.border }}>
              <div>
                <h2 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Certificados ICP Brasil</h2>
                <p className="text-xs" style={{ color: v.sub }}>Emitidos e assinados digitalmente</p>
              </div>
              <Award size={16} style={{ color: "#8B5CF6" }} />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${v.border}` }}>
                    {["ID do Certificado", "Campanha", "Emissor", "Emitido", "Validade", "Trust", "Status"].map((h, i) => (
                      <th key={i} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: v.muted }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: v.border }}>
                  {certificates.map((c, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-mono text-xs text-white">{c.id}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: v.sub }}>{c.campaign}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#8B5CF615", color: "#8B5CF6" }}>{c.issuer}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: v.muted }}>{c.issued}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: v.muted }}>{c.expires}</td>
                      <td className="px-5 py-3.5 font-bold text-xs" style={{ color: v.success }}>{c.trust}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${c.status === "valid" ? "text-[#22C55E]" : "text-[#F59E0B]"}`}
                          style={{ background: c.status === "valid" ? "#22C55E15" : "#F59E0B15" }}>
                          {c.status === "valid" ? "✓ Válido" : "⚠ Expirando"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === "reports" && (
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: v.border }}>
              <div>
                <h2 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Relatórios de Auditoria</h2>
                <p className="text-xs" style={{ color: v.sub }}>Exportação em PDF com assinatura digital</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                style={{ background: v.primary }}>
                <Download size={13} /> Novo relatório
              </button>
            </div>
            <div className="divide-y" style={{ borderColor: v.border }}>
              {reports.map((r, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "#EF444415" }}>
                    <FileText size={18} style={{ color: "#EF4444" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{r.name}</p>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px]" style={{ color: v.muted }}>
                      <span>{r.type} · {r.size}</span>
                      <span>Período: {r.period}</span>
                      <span>Gerado: {r.generated}</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:-translate-y-0.5"
                    style={{ background: "#22C55E15", color: v.success, border: "1px solid #22C55E30" }}>
                    <Download size={12} /> Download
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
