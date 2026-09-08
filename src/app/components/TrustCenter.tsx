import { useState } from "react";
import { ArrowLeft, Shield, CheckCircle2, Clock, AlertTriangle, Download, ExternalLink, Activity, Lock, FileText, Eye } from "lucide-react";

const dark = { bg: "#020617", card: "#071225", border: "#13233E", sub: "#94A3B8" };

const proofTimeline = [
  { time: "14:32:01", tx: "0x7f3a...d4b2", screen: "SCR-00847", campaign: "Bradesco Black Friday", status: "verified" as const, cert: "CERT-2024-00847" },
  { time: "14:31:58", tx: "0x2c8e...f91a", screen: "SCR-00123", campaign: "iFood Cupons", status: "verified" as const, cert: "CERT-2024-00123" },
  { time: "14:31:55", tx: "0x9b1d...a337", screen: "SCR-00512", campaign: "Samsung Galaxy", status: "verified" as const, cert: "CERT-2024-00512" },
  { time: "14:31:51", tx: "0x4e7f...c28b", screen: "SCR-00089", campaign: "Natura Perfumes", status: "pending" as const, cert: "—" },
  { time: "14:31:47", tx: "0x1b3c...e84a", screen: "SCR-01024", campaign: "Ambev Verão", status: "verified" as const, cert: "CERT-2024-01024" },
  { time: "14:31:40", tx: "0x8d2a...c19e", screen: "SCR-00731", campaign: "Samsung Galaxy", status: "verified" as const, cert: "CERT-2024-00731" },
  { time: "14:31:35", tx: "0x3f9b...a82d", screen: "SCR-00204", campaign: "Bradesco Black Friday", status: "failed" as const, cert: "—" },
];

const certCards = [
  { name: "ICP Brasil A3", issuer: "AC Serpro", expires: "2026-12-31", status: "valid" as const },
  { name: "Ethereum Mainnet Anchor", issuer: "DOOHPLAY", expires: "Contínuo", status: "valid" as const },
  { name: "LGPD Adequação", issuer: "DPO Interno", expires: "2026-06-30", status: "valid" as const },
  { name: "SOC 2 Type II", issuer: "KPMG", expires: "Em auditoria", status: "pending" as const },
];

const riskBreakdown = [
  { label: "Campanhas sem anomalia", value: 121, total: 124, color: "#22C55E" },
  { label: "Campanhas com alerta", value: 3, total: 124, color: "#FACC15" },
  { label: "Certificados próx. vencimento", value: 2, total: 20, color: "#FF6B00" },
  { label: "Anomalias de Proof-of-Play", value: 1, total: 2800000, color: "#EF4444" },
];

const verificationLayers = [
  { name: "ICP Brasil", description: "Assinatura digital certificada", status: "active" as const, color: "#22C55E" },
  { name: "Signature", description: "ECDSA válida em todos os proofs", status: "active" as const, color: "#22C55E" },
  { name: "Merkle Tree", description: "Raíz Merkle sincronizada", status: "active" as const, color: "#22C55E" },
  { name: "Blockchain", description: "Ancorado na Ethereum Mainnet", status: "active" as const, color: "#22C55E" },
  { name: "Timestamp", description: "RFC 3161 verificado", status: "active" as const, color: "#22C55E" },
  { name: "Certificate", description: "Certificado X.509 emitido", status: "active" as const, color: "#22C55E" },
];

interface TrustCenterProps {
  onBack: () => void;
}

export default function TrustCenter({ onBack }: TrustCenterProps) {
  const [filter, setFilter] = useState<"all" | "verified" | "pending" | "failed">("all");

  const filtered = proofTimeline.filter(e => filter === "all" || e.status === filter);

  const statusStyle = (s: "verified" | "pending" | "failed") => ({
    verified: { color: "#22C55E", bg: "#22C55E20", label: "Verificado", icon: CheckCircle2 },
    pending: { color: "#FACC15", bg: "#FACC1520", label: "Pendente", icon: Clock },
    failed: { color: "#EF4444", bg: "#EF444420", label: "Falha", icon: AlertTriangle },
  }[s]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: dark.bg }}>
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ background: dark.card, borderColor: dark.border }}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5" style={{ color: dark.sub }}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-bold text-white" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Trust Center</h1>
            <p className="text-xs" style={{ color: dark.sub }}>Proof-of-Play Auditável · ICP Brasil · Ethereum Mainnet</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono" style={{ backgroundColor: "#22C55E20", color: "#22C55E" }}>
            <Activity size={11} className="animate-pulse" /> 97.3% verificado
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border" style={{ color: "#00A3FF", borderColor: "#00A3FF40" }}>
            <Download size={14} /> Export Audit Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:opacity-90">
            <Eye size={14} /> Ver certificado público
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="rounded-2xl p-7 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0D1F3C, #070B17)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#00A3FF20" }}>
              <Shield size={24} className="text-[#00A3FF]" />
            </div>
            <div>
              <p className="font-bold text-white text-lg">Trust Center — Proof-of-Play Auditável</p>
              <p className="text-xs" style={{ color: dark.sub }}>Verificação criptográfica em tempo real · ICP Brasil · Blockchain Ethereum</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            {[
              { label: "Trust Score", value: "97.3", unit: "/100", color: "#22C55E" },
              { label: "Risk Score", value: "12.8", unit: "/100", color: "#FACC15" },
              { label: "Proofs verificados", value: "2.8M", unit: "hoje", color: "#00A3FF" },
              { label: "Certificados emitidos", value: "847K", unit: "total", color: "#2563EB" },
              { label: "Assinaturas válidas", value: "99.1%", unit: "", color: "#22C55E" },
              { label: "Eventos com falha", value: "0.9%", unit: "", color: "#EF4444" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-[11px] mb-1" style={{ color: dark.sub }}>{s.label}</p>
                <p className="text-2xl font-extrabold" style={{ color: s.color }}>
                  {s.value}<span className="text-xs font-normal ml-1" style={{ color: dark.sub }}>{s.unit}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[
            { score: 97, label: "Excelente", title: "Trust Score Geral", color: "#22C55E", bg: "#22C55E15", desc: "Verificação criptográfica ativa" },
            { score: 13, label: "Baixo risco", title: "Risk Score Médio", color: "#FACC15", bg: "#FACC1515", desc: "3 alertas ativos" },
            { score: 98, label: "Certificado", title: "ICP Brasil Compliance", color: "#00A3FF", bg: "#00A3FF15", desc: "A3 · AC Serpro" },
          ].map((ts, i) => (
            <div key={i} className="rounded-xl p-5 border" style={{ background: dark.card, borderColor: dark.border }}>
              <div className="flex items-center gap-2 mb-3">
                <Shield size={16} style={{ color: ts.color }} />
                <span className="text-sm font-semibold text-white">{ts.title}</span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-extrabold" style={{ color: ts.color }}>{ts.score}</span>
                <span className="text-sm" style={{ color: dark.sub }}>/100</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ backgroundColor: dark.bg }}>
                <div className="h-full rounded-full" style={{ width: `${ts.score}%`, backgroundColor: ts.color }} />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium" style={{ color: ts.color }}>{ts.label}</p>
                <p className="text-xs" style={{ color: dark.sub }}>{ts.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-5 border" style={{ background: dark.card, borderColor: dark.border }}>
          <h3 className="font-semibold text-white mb-4">Layer Verification</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {verificationLayers.map((layer, i) => (
              <div key={i} className="rounded-xl p-4 text-center" style={{ background: dark.bg, border: `1px solid ${layer.color}30` }}>
                <CheckCircle2 size={20} style={{ color: layer.color }} className="mx-auto mb-2" />
                <p className="text-xs font-bold text-white">{layer.name}</p>
                <p className="text-[10px] mt-1" style={{ color: layer.color }}>Ativo</p>
                <p className="text-[10px] mt-0.5" style={{ color: dark.sub }}>{layer.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border" style={{ background: dark.card, borderColor: dark.border }}>
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: dark.border }}>
              <div>
                <h3 className="font-semibold text-white">Proof Timeline</h3>
                <p className="text-xs mt-0.5" style={{ color: dark.sub }}>Verificações em tempo real</p>
              </div>
              <div className="flex gap-1.5">
                {(["all", "verified", "pending", "failed"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                    style={filter === f ? { backgroundColor: "#00A3FF20", color: "#00A3FF" } : { color: dark.sub }}
                  >
                    {f === "all" ? "Todos" : f === "verified" ? "✓" : f === "pending" ? "⏳" : "✗"}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: dark.border }}>
              {filtered.map((ev, i) => {
                const st = statusStyle(ev.status);
                return (
                  <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02]">
                    <st.icon size={15} style={{ color: st.color }} className="mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold" style={{ color: "#00A3FF" }}>{ev.tx}</span>
                        <span className="text-[10px]" style={{ color: dark.sub }}>{ev.time}</span>
                      </div>
                      <p className="text-xs text-white mt-0.5">{ev.screen} · {ev.campaign}</p>
                      {ev.cert !== "—" && (
                        <p className="text-[10px] mt-0.5 font-mono" style={{ color: dark.sub }}>{ev.cert}</p>
                      )}
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border" style={{ background: dark.card, borderColor: dark.border }}>
              <div className="p-5 border-b" style={{ borderColor: dark.border }}>
                <h3 className="font-semibold text-white">Certificações</h3>
              </div>
              <div className="divide-y" style={{ borderColor: dark.border }}>
                {certCards.map((cert, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02]">
                    <div style={{ color: cert.status === "valid" ? "#22C55E" : "#FACC15" }}>
                      {cert.status === "valid" ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{cert.name}</p>
                      <p className="text-xs" style={{ color: dark.sub }}>{cert.issuer} · {cert.expires}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: cert.status === "valid" ? "#22C55E20" : "#FACC1520", color: cert.status === "valid" ? "#22C55E" : "#FACC15" }}>
                        {cert.status === "valid" ? "Válido" : "Pendente"}
                      </span>
                      <button style={{ color: dark.sub }}>
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-5 border" style={{ background: dark.card, borderColor: dark.border }}>
              <h3 className="font-semibold text-white mb-4">Risk Breakdown</h3>
              <div className="space-y-3">
                {riskBreakdown.map((r, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "#94A3B8" }}>{r.label}</span>
                      <span className="font-mono font-bold" style={{ color: r.color }}>{r.value}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: dark.bg }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min((r.value / r.total) * 100, 100)}%`, backgroundColor: r.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-5 rounded-xl border" style={{ background: dark.card, borderColor: dark.border }}>
          <div className="flex items-center gap-4">
            <Lock size={20} style={{ color: "#00A3FF" }} />
            <div>
              <p className="text-sm font-semibold text-white">Compliance LGPD & ICP Brasil</p>
              <p className="text-xs" style={{ color: dark.sub }}>Todos os dados são tratados conforme a LGPD · Certificação ICP Brasil A3 ativa</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm" style={{ backgroundColor: "#00A3FF20", color: "#00A3FF", border: "1px solid #00A3FF40" }}>
            <Download size={15} /> Export Audit Certificate PDF
          </button>
        </div>
      </div>
    </div>
  );
}
