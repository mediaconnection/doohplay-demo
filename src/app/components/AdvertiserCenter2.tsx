import { useState, useEffect } from "react";
import { ArrowLeft, Shield, CheckCircle, Clock, Eye, DollarSign, Target, BarChart2, Download, ExternalLink, RefreshCw, Play, Pause, Filter, Search, ChevronDown, Zap, Hash, Link2, FileText, Star } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

function randHex(n: number) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

let _popSeq = 0;
function uniquePopId() {
  return `POP-${Math.random().toString(36).substr(2, 5).toUpperCase()}${String(_popSeq++ % 100).padStart(2, "0")}`;
}

const CAMPAIGNS = [
  { id: "CAM-001", name: "Black Friday Eletrônicos", advertiser: "TechStore Brasil", status: "active", budget: 12000, spent: 8340, impressions: 284200, cpm: 29.30, score: 100, screens: 47 },
  { id: "CAM-002", name: "Promoção Verão 2026", advertiser: "Moda & Estilo", status: "active", budget: 5000, spent: 2180, impressions: 89400, cpm: 24.38, score: 100, screens: 22 },
  { id: "CAM-003", name: "Lançamento Produto X", advertiser: "StartupXYZ", status: "paused", budget: 8000, spent: 7210, impressions: 312000, cpm: 23.11, score: 98, screens: 63 },
  { id: "CAM-004", name: "Campanha Institucional", advertiser: "Banco Delta", status: "completed", budget: 20000, spent: 19870, impressions: 821000, cpm: 24.20, score: 100, screens: 118 },
];

function buildProof() {
  return {
    id: uniquePopId(),
    campaign: CAMPAIGNS[Math.floor(Math.random() * CAMPAIGNS.length)].name,
    screen: `SCR-${randHex(4).toUpperCase()}`,
    location: ["São Paulo, SP", "Rio de Janeiro, RJ", "Curitiba, PR", "Belo Horizonte, MG", "Porto Alegre, RS"][Math.floor(Math.random() * 5)],
    duration: [10, 15, 20, 30][Math.floor(Math.random() * 4)],
    rsaHash: "sha256:" + randHex(32),
    merkleRoot: "0x" + randHex(32),
    polygonTx: "0x" + randHex(32),
    tsaTimestamp: new Date().toISOString(),
    score: 100,
    time: new Date().toLocaleTimeString("pt-BR"),
  };
}

interface Props { onBack: () => void; }

export default function AdvertiserCenter2({ onBack }: Props) {
  const [tab, setTab] = useState<"overview" | "campaigns" | "proofs" | "reports">("overview");
  const [selectedCampaign, setSelectedCampaign] = useState<typeof CAMPAIGNS[0] | null>(null);
  const [proofs, setProofs] = useState(() => Array.from({ length: 12 }, buildProof));
  const [liveRunning, setLiveRunning] = useState(true);
  const [proofDetail, setProofDetail] = useState<ReturnType<typeof buildProof> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<null | "valid" | "invalid">(null);

  useEffect(() => {
    if (!liveRunning) return;
    const iv = setInterval(() => {
      setProofs(prev => [buildProof(), ...prev.slice(0, 49)]);
    }, 2500);
    return () => clearInterval(iv);
  }, [liveRunning]);

  const handleVerify = (proof: ReturnType<typeof buildProof>) => {
    setProofDetail(proof);
    setVerifying(true);
    setVerifyResult(null);
    setTimeout(() => {
      setVerifying(false);
      setVerifyResult("valid");
    }, 1800);
  };

  const filteredProofs = proofs.filter(p =>
    !searchTerm || p.campaign.toLowerCase().includes(searchTerm.toLowerCase()) || p.screen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalImpressions = CAMPAIGNS.reduce((a, c) => a + c.impressions, 0);
  const totalSpent = CAMPAIGNS.reduce((a, c) => a + c.spent, 0);
  const activeCampaigns = CAMPAIGNS.filter(c => c.status === "active").length;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft size={18} style={{ color: T.textSub }} />
          </button>
          <div>
            <h1 className="font-black text-lg">Advertiser Center</h1>
            <p className="text-xs" style={{ color: T.textSub }}>Campanhas · Proof-of-Play · Transparência blockchain</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: T.success + "15", color: T.success }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.success }} />
              ProofChain Ativo · 100/100
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 flex gap-1 pb-1">
          {(["overview", "campaigns", "proofs", "reports"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all"
              style={{ background: tab === t ? T.primary + "20" : "transparent", color: tab === t ? T.primary : T.textSub }}>
              {t === "overview" ? "Visão Geral" : t === "campaigns" ? "Campanhas" : t === "proofs" ? "Proof-of-Play" : "Relatórios"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Impressões totais", value: totalImpressions.toLocaleString("pt-BR"), sub: "todas as campanhas", color: T.primary, icon: Eye },
                { label: "Investimento", value: `R$${totalSpent.toLocaleString("pt-BR")}`, sub: "gasto até agora", color: T.success, icon: DollarSign },
                { label: "Campanhas ativas", value: activeCampaigns, sub: "de 4 total", color: T.accent, icon: Target },
                { label: "Score de prova", value: "100/100", sub: "blockchain verificado", color: T.gold, icon: Shield },
              ].map((m, i) => {
                const Icon = m.icon;
                return (
                  <div key={i} className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium" style={{ color: T.textSub }}>{m.label}</span>
                      <Icon size={16} style={{ color: m.color }} />
                    </div>
                    <div className="text-3xl font-black mb-1" style={{ color: m.color }}>{m.value}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{m.sub}</div>
                  </div>
                );
              })}
            </div>

            {/* ProofChain architecture */}
            <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-3 mb-6">
                <Shield size={20} style={{ color: T.success }} />
                <h3 className="font-bold text-lg">Como funciona o ProofChain</h3>
                <span className="ml-auto text-xs px-3 py-1 rounded-full font-medium" style={{ background: T.success + "15", color: T.success }}>Certificado · ICP-Brasil A3</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { step: "1", title: "Assinatura RSA-SHA256", desc: "Cada exibição é assinada digitalmente no dispositivo com chave RSA-2048.", color: T.primary, icon: "🔐" },
                  { step: "2", title: "Árvore de Merkle", desc: "As exibições do dia são agrupadas em árvore imutável — qualquer alteração invalida o hash raiz.", color: T.accent, icon: "🌳" },
                  { step: "3", title: "Ancoragem Polygon", desc: "O Merkle Root é gravado on-chain na rede Polygon em transação pública e auditável.", color: "#8247E5", icon: "⛓️" },
                  { step: "4", title: "TSA RFC 3161", desc: "Timestamp da autoridade RFC 3161 garante prova de existência em tempo legal.", color: T.gold, icon: "⏱️" },
                ].map(l => (
                  <div key={l.step} className="rounded-xl border p-4 relative" style={{ background: T.panel, borderColor: l.color + "30" }}>
                    <div className="text-2xl mb-3">{l.icon}</div>
                    <div className="text-xs font-bold mb-1" style={{ color: l.color }}>Camada {l.step}</div>
                    <div className="font-semibold text-sm mb-2">{l.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: T.textSub }}>{l.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live proof feed preview */}
            <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />
                <h3 className="font-bold">Feed ao vivo</h3>
                <span className="text-xs" style={{ color: T.textSub }}>Ultima prova: {proofs[0]?.time}</span>
                <button onClick={() => setTab("proofs")} className="ml-auto text-xs" style={{ color: T.primary }}>Ver todas →</button>
              </div>
              <div className="space-y-2">
                {proofs.slice(0, 5).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border text-sm transition-all"
                    style={{ background: i === 0 ? T.success + "08" : T.panel, borderColor: i === 0 ? T.success + "25" : T.border }}>
                    <CheckCircle size={13} style={{ color: T.success, flexShrink: 0 }} />
                    <span className="font-mono text-xs flex-shrink-0" style={{ color: T.textSub }}>{p.id}</span>
                    <span className="flex-1 truncate">{p.campaign}</span>
                    <span className="text-xs flex-shrink-0" style={{ color: T.textSub }}>{p.location}</span>
                    <span className="flex-shrink-0 font-bold text-xs" style={{ color: T.success }}>✓ 100</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CAMPAIGNS */}
        {tab === "campaigns" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Minhas campanhas</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: T.primary, color: "#fff" }}>
                + Nova campanha
              </button>
            </div>

            <div className="space-y-3">
              {CAMPAIGNS.map(c => {
                const pct = c.spent / c.budget;
                const statusColor = c.status === "active" ? T.success : c.status === "paused" ? T.warning : T.textSub;
                return (
                  <div key={c.id} onClick={() => setSelectedCampaign(selectedCampaign?.id === c.id ? null : c)}
                    className="rounded-2xl border p-5 cursor-pointer transition-all hover:border-opacity-80"
                    style={{ background: T.card, borderColor: selectedCampaign?.id === c.id ? T.primary : T.border }}>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold">{c.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ background: statusColor + "20", color: statusColor }}>
                            {c.status === "active" ? "Ativa" : c.status === "paused" ? "Pausada" : "Concluída"}
                          </span>
                          {c.score === 100 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: T.success + "15", color: T.success }}>✓ Prova 100</span>}
                        </div>
                        <div className="text-sm mb-3" style={{ color: T.textSub }}>{c.advertiser} · {c.screens} telas</div>
                        <div className="h-1.5 rounded-full mb-1" style={{ background: T.border }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct * 100, 100)}%`, background: pct > 0.9 ? T.warning : T.primary }} />
                        </div>
                        <div className="text-xs" style={{ color: T.textSub }}>
                          R${c.spent.toLocaleString("pt-BR")} / R${c.budget.toLocaleString("pt-BR")} ({Math.round(pct * 100)}%)
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black text-2xl" style={{ color: T.primary }}>{c.impressions.toLocaleString("pt-BR")}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>impressões</div>
                        <div className="text-sm mt-1 font-medium" style={{ color: T.textSub }}>CPM R${c.cpm.toFixed(2)}</div>
                      </div>
                    </div>

                    {selectedCampaign?.id === c.id && (
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: T.border }}>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {[
                            { l: "Orçamento", v: `R$${c.budget.toLocaleString("pt-BR")}` },
                            { l: "Gasto", v: `R$${c.spent.toLocaleString("pt-BR")}` },
                            { l: "CPM", v: `R$${c.cpm.toFixed(2)}` },
                            { l: "Telas ativas", v: c.screens },
                          ].map((s, i) => (
                            <div key={i} className="rounded-lg p-3 text-center" style={{ background: T.panel }}>
                              <div className="text-xs mb-1" style={{ color: T.textSub }}>{s.l}</div>
                              <div className="font-bold text-sm">{s.v}</div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setTab("proofs")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: T.success + "15", color: T.success }}>
                            <Shield size={12} /> Ver Proof-of-Play
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: T.primary + "15", color: T.primary }}>
                            <Download size={12} /> Exportar relatório
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium ml-auto" style={{ background: T.panel, color: T.textSub }}>
                            <ExternalLink size={12} /> Blockchain explorer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROOFS */}
        {tab === "proofs" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-bold text-lg">Proof-of-Play</h2>
              <div className="flex items-center gap-2 ml-auto">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm" style={{ background: T.card, borderColor: T.border }}>
                  <Search size={13} style={{ color: T.textSub }} />
                  <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Buscar campanha..."
                    className="bg-transparent outline-none text-sm w-40"
                    style={{ color: T.text }} />
                </div>
                <button onClick={() => setLiveRunning(r => !r)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium"
                  style={{ background: T.card, borderColor: T.border, color: liveRunning ? T.success : T.textSub }}>
                  {liveRunning ? <><Pause size={12} /> Ao vivo</> : <><Play size={12} /> Pausado</>}
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="rounded-xl border p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs" style={{ background: T.card, borderColor: T.border }}>
              {[
                { label: "RSA-SHA256", desc: "Assinatura no dispositivo", color: T.primary },
                { label: "Merkle Tree", desc: "Hash imutável do dia", color: T.accent },
                { label: "Polygon", desc: "On-chain ancoragem", color: "#8247E5" },
                { label: "TSA RFC3161", desc: "Timestamp legal", color: T.gold },
              ].map((l, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: l.color }} />
                  <div>
                    <div className="font-medium">{l.label}</div>
                    <div style={{ color: T.textSub }}>{l.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Proofs list */}
            <div className="space-y-2">
              {filteredProofs.slice(0, 30).map((p, i) => (
                <div key={p.id} className="rounded-xl border transition-all hover:border-opacity-80"
                  style={{ background: i === 0 && liveRunning ? T.success + "06" : T.card, borderColor: i === 0 && liveRunning ? T.success + "30" : T.border }}>
                  <div className="flex items-center gap-3 p-4">
                    <CheckCircle size={16} style={{ color: T.success, flexShrink: 0 }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-bold" style={{ color: T.textSub }}>{p.id}</span>
                        {i === 0 && liveRunning && <span className="text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: T.success + "20", color: T.success }}>NOVO</span>}
                      </div>
                      <div className="text-sm font-medium truncate">{p.campaign}</div>
                      <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{p.screen} · {p.location} · {p.duration}s · {p.time}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="font-black text-sm" style={{ color: T.success }}>100</span>
                      <button onClick={() => handleVerify(p)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: T.primary + "15", color: T.primary }}>
                        Verificar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {tab === "reports" && (
          <div className="space-y-5">
            <h2 className="font-bold text-lg">Relatórios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: "Relatório de Impressões", desc: "Totais por campanha, tela e período.", icon: BarChart2, format: "PDF + CSV" },
                { title: "Audit Trail Blockchain", desc: "Todas as provas on-chain com tx hash.", icon: Link2, format: "JSON + PDF" },
                { title: "Proof-of-Play Certificado", desc: "Documento assinado ICP-Brasil A3.", icon: Shield, format: "PDF assinado" },
                { title: "Relatório Financeiro", desc: "CPM, gasto, budget e projeções.", icon: DollarSign, format: "Excel + PDF" },
                { title: "Performance por Tela", desc: "Impressões, uptime e fill rate por local.", icon: Target, format: "CSV + PDF" },
                { title: "Log TSA RFC 3161", desc: "Timestamps legais de todas as exibições.", icon: Clock, format: "TXT + PDF" },
              ].map((r, i) => {
                const Icon = r.icon;
                return (
                  <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: T.primary + "15" }}>
                      <Icon size={18} style={{ color: T.primary }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold mb-1">{r.title}</div>
                      <div className="text-sm mb-3" style={{ color: T.textSub }}>{r.desc}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-lg" style={{ background: T.panel, color: T.textSub }}>{r.format}</span>
                        <button className="flex items-center gap-1.5 text-xs font-medium ml-auto" style={{ color: T.primary }}>
                          <Download size={12} /> Baixar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Proof detail modal */}
      {proofDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={e => { if (e.target === e.currentTarget) { setProofDetail(null); setVerifyResult(null); } }}>
          <div className="w-full max-w-lg rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
            <div className="p-6 border-b" style={{ borderColor: T.border }}>
              <div className="flex items-center gap-3">
                <Shield size={20} style={{ color: T.success }} />
                <div>
                  <div className="font-bold">Verificação ProofChain</div>
                  <div className="text-xs font-mono" style={{ color: T.textSub }}>{proofDetail.id}</div>
                </div>
                {verifyResult === "valid" && (
                  <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: T.success + "20", color: T.success }}>
                    <CheckCircle size={12} /> VÁLIDO · 100/100
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 space-y-4">
              {verifying ? (
                <div className="flex flex-col items-center py-8 gap-4">
                  <RefreshCw size={32} className="animate-spin" style={{ color: T.primary }} />
                  <div className="text-sm" style={{ color: T.textSub }}>Verificando 4 camadas criptográficas...</div>
                  {[
                    { label: "RSA-SHA256", color: T.primary },
                    { label: "Merkle Tree", color: T.accent },
                    { label: "Polygon On-chain", color: "#8247E5" },
                    { label: "TSA RFC 3161", color: T.gold },
                  ].map((l, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs" style={{ color: T.textSub }}>
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: l.color, animationDelay: `${i * 200}ms` }} />
                      {l.label}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="rounded-xl p-4 space-y-2 font-mono text-xs" style={{ background: T.panel }}>
                    {[
                      { label: "Campanha", value: proofDetail.campaign },
                      { label: "Tela", value: proofDetail.screen },
                      { label: "Local", value: proofDetail.location },
                      { label: "Duração", value: `${proofDetail.duration}s` },
                      { label: "RSA Hash", value: proofDetail.rsaHash.slice(0, 40) + "..." },
                      { label: "Merkle Root", value: proofDetail.merkleRoot.slice(0, 40) + "..." },
                      { label: "Polygon TX", value: proofDetail.polygonTx.slice(0, 40) + "..." },
                      { label: "TSA Timestamp", value: proofDetail.tsaTimestamp },
                    ].map((f, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="w-28 flex-shrink-0" style={{ color: T.textSub }}>{f.label}:</span>
                        <span className="truncate" style={{ color: T.text }}>{f.value}</span>
                      </div>
                    ))}
                  </div>
                  {verifyResult === "valid" && (
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: "RSA", color: T.primary },
                        { label: "Merkle", color: T.accent },
                        { label: "Polygon", color: "#8247E5" },
                        { label: "TSA", color: T.gold },
                      ].map((l, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-lg text-xs" style={{ background: l.color + "10", border: `1px solid ${l.color}30` }}>
                          <CheckCircle size={14} style={{ color: l.color }} />
                          <span style={{ color: l.color }}>{l.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: T.primary + "15", color: T.primary }}>
                      <Download size={12} /> PDF certificado
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: T.panel, color: T.textSub }}>
                      <ExternalLink size={12} /> Polygon explorer
                    </button>
                    <button onClick={() => { setProofDetail(null); setVerifyResult(null); }}
                      className="ml-auto px-3 py-2 rounded-xl text-xs" style={{ color: T.textSub }}>
                      Fechar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
