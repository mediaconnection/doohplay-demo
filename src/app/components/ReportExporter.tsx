import { useState } from "react";
import { ArrowLeft, Download, FileText, BarChart2, Shield, Calendar, Clock, CheckCircle, Loader, Eye, ChevronRight, Printer, Share2, Lock, Star } from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type ReportType = "proof" | "analytics" | "billing" | "compliance" | "custom";
type Format = "pdf" | "csv" | "xlsx" | "json";
type GenerationState = "idle" | "generating" | "done";

interface ReportTemplate {
  id: ReportType;
  name: string;
  desc: string;
  icon: string;
  sections: string[];
  formats: Format[];
  popular?: boolean;
  planRequired?: string;
}

interface GeneratedReport {
  id: string;
  name: string;
  type: ReportType;
  format: Format;
  generated: string;
  size: string;
  pages?: number;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: "proof", name: "Prova de Exibição (ProofChain)", icon: "🔐",
    desc: "Relatório certificado com assinatura ICP-Brasil, hash Merkle e âncora Polygon.",
    sections: ["Resumo executivo", "Linha do tempo de exibições", "Verificações de hash", "Âncora blockchain", "Assinatura digital"],
    formats: ["pdf"],
    popular: true,
  },
  {
    id: "analytics", name: "Analytics Completo", icon: "📊",
    desc: "Impressões, CPM, fill rate, distribuição de audiência e comparativo por período.",
    sections: ["KPIs principais", "Gráficos de tendência", "Análise por horário", "Audiência segmentada", "Comparativo mensal"],
    formats: ["pdf", "csv", "xlsx"],
  },
  {
    id: "billing", name: "Extrato Financeiro", icon: "💰",
    desc: "Receita por tela, anunciante, período e composição de faturamento.",
    sections: ["Resumo financeiro", "Receita por tela", "Receita por anunciante", "Histórico de pagamentos", "Notas fiscais"],
    formats: ["pdf", "csv", "xlsx"],
  },
  {
    id: "compliance", name: "Auditoria & Compliance", icon: "⚖️",
    desc: "Relatório para auditores e compliance com rastreabilidade completa (LGPD).",
    sections: ["Trilha de auditoria", "Logs de acesso", "Conformidade LGPD", "Políticas de retenção", "Certificações"],
    formats: ["pdf"],
    planRequired: "enterprise",
  },
  {
    id: "custom", name: "Relatório Personalizado", icon: "✏️",
    desc: "Selecione métricas, período e formato para um relatório sob medida.",
    sections: [],
    formats: ["pdf", "csv", "xlsx", "json"],
    planRequired: "pro",
  },
];

const RECENT: GeneratedReport[] = [
  { id: "r1", name: "ProofChain — Junho 2026",    type: "proof",     format: "pdf",  generated: "01/07/2026 09:14", size: "2.4 MB",  pages: 18 },
  { id: "r2", name: "Analytics — Junho 2026",     type: "analytics", format: "xlsx", generated: "01/07/2026 09:15", size: "840 KB" },
  { id: "r3", name: "Extrato Financeiro — Jun/26", type: "billing",   format: "pdf",  generated: "01/07/2026 09:16", size: "1.1 MB",  pages: 7 },
  { id: "r4", name: "ProofChain — Maio 2026",      type: "proof",     format: "pdf",  generated: "02/06/2026 08:55", size: "2.1 MB",  pages: 16 },
  { id: "r5", name: "Analytics — Maio 2026",       type: "analytics", format: "csv",  generated: "02/06/2026 08:56", size: "220 KB" },
];

const FORMAT_INFO: Record<Format, { label: string; color: string; icon: string }> = {
  pdf:  { label: "PDF",  color: T.danger,   icon: "📄" },
  csv:  { label: "CSV",  color: T.success,  icon: "📋" },
  xlsx: { label: "XLSX", color: T.primary,  icon: "📊" },
  json: { label: "JSON", color: T.accent,   icon: "{ }" },
};

const TYPE_COLORS: Record<ReportType, string> = {
  proof: T.success, analytics: T.primary, billing: T.gold,
  compliance: T.accent, custom: T.warning,
};

interface Props {
  onBack: () => void;
  session?: { plan?: string } | null;
}

export default function ReportExporter({ onBack, session }: Props) {
  const [selected, setSelected] = useState<ReportTemplate | null>(null);
  const [format, setFormat] = useState<Format>("pdf");
  const [period, setPeriod] = useState("month");
  const [customSections, setCustomSections] = useState<string[]>([]);
  const [state, setState] = useState<GenerationState>("idle");
  const [progress, setProgress] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const plan = session?.plan ?? "starter";

  const ALL_METRICS = ["Impressões totais", "CPM médio", "Fill rate", "Receita bruta", "Provas emitidas", "Uptime da tela", "Engajamento por horário", "Análise de audiência"];

  const startGenerate = () => {
    setState("generating");
    setProgress(0);
    const steps = [10, 25, 45, 60, 78, 92, 100];
    steps.forEach((p, i) => setTimeout(() => {
      setProgress(p);
      if (p === 100) setState("done");
    }, (i + 1) * 600));
  };

  const reset = () => { setState("idle"); setProgress(0); };

  const isLocked = (tpl: ReportTemplate) =>
    tpl.planRequired && plan === "starter" && tpl.planRequired !== "starter";

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={selected ? () => { setSelected(null); reset(); } : onBack}
            className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
              <FileText size={18} style={{ color: T.primary }} />
            </div>
            <div>
              <h1 className="font-black text-lg">{selected ? selected.name : "Exportar Relatórios"}</h1>
              <p className="text-xs" style={{ color: T.textSub }}>
                {selected ? `Formato: ${FORMAT_INFO[format].label}` : `${RECENT.length} relatórios gerados`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

        {!selected ? (
          <>
            {/* Template grid */}
            <div>
              <h2 className="font-bold mb-4">Tipos de relatório</h2>
              <div className="space-y-3">
                {REPORT_TEMPLATES.map(tpl => {
                  const locked = isLocked(tpl);
                  return (
                    <button key={tpl.id} onClick={() => !locked && setSelected(tpl)}
                      className="w-full text-left rounded-2xl border p-4 transition-all hover:border-opacity-60"
                      style={{
                        background: T.card, borderColor: TYPE_COLORS[tpl.id] + "20",
                        opacity: locked ? 0.6 : 1,
                        cursor: locked ? "not-allowed" : "pointer",
                      }}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{tpl.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-sm">{tpl.name}</span>
                            {tpl.popular && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full"
                                style={{ background: T.gold + "20", color: T.gold }}>Popular</span>
                            )}
                            {locked && <Lock size={12} style={{ color: T.textSub }} />}
                            {tpl.planRequired && !locked && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full capitalize"
                                style={{ background: T.primary + "15", color: T.primary }}>{tpl.planRequired}</span>
                            )}
                          </div>
                          <p className="text-xs mb-2" style={{ color: T.textSub }}>{tpl.desc}</p>
                          <div className="flex items-center gap-2">
                            {tpl.formats.map(f => (
                              <span key={f} className="text-xs px-1.5 py-0.5 rounded"
                                style={{ background: FORMAT_INFO[f].color + "15", color: FORMAT_INFO[f].color }}>
                                {FORMAT_INFO[f].icon} {FORMAT_INFO[f].label}
                              </span>
                            ))}
                          </div>
                        </div>
                        <ChevronRight size={16} style={{ color: T.textSub, marginTop: 2 }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent */}
            <div>
              <h2 className="font-bold mb-4">Relatórios recentes</h2>
              <div className="space-y-2">
                {RECENT.map(r => {
                  const fi = FORMAT_INFO[r.format];
                  return (
                    <div key={r.id} className="flex items-center gap-3 p-3.5 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: fi.color + "15" }}>
                        <span className="text-sm">{fi.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{r.name}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>
                          {r.generated} · {r.size}{r.pages ? ` · ${r.pages} páginas` : ""}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-white/5 transition-all">
                          <Eye size={14} style={{ color: T.textSub }} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/5 transition-all">
                          <Download size={14} style={{ color: T.primary }} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/5 transition-all">
                          <Share2 size={14} style={{ color: T.textSub }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            {state === "idle" && (
              <>
                {/* Config panel */}
                <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                  <h3 className="font-bold mb-4">Configuração do relatório</h3>
                  <div className="space-y-4">
                    {/* Period */}
                    <div>
                      <label className="block text-sm mb-2" style={{ color: T.textSub }}>Período</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { id: "week", label: "7 dias" },
                          { id: "month", label: "Julho/26" },
                          { id: "quarter", label: "Trimestre" },
                          { id: "custom", label: "Personalizado" },
                        ].map(p => (
                          <button key={p.id} onClick={() => setPeriod(p.id)}
                            className="py-2 rounded-xl text-xs font-medium transition-all"
                            style={{
                              background: period === p.id ? T.primary : T.panel,
                              color: period === p.id ? "#fff" : T.textSub,
                              border: `1px solid ${period === p.id ? T.primary : T.border}`,
                            }}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Format */}
                    <div>
                      <label className="block text-sm mb-2" style={{ color: T.textSub }}>Formato de saída</label>
                      <div className="flex gap-2">
                        {selected.formats.map(f => {
                          const fi = FORMAT_INFO[f];
                          return (
                            <button key={f} onClick={() => setFormat(f)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all"
                              style={{
                                background: format === f ? fi.color + "20" : T.panel,
                                color: format === f ? fi.color : T.textSub,
                                border: `1px solid ${format === f ? fi.color : T.border}`,
                              }}>
                              {fi.icon} {fi.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sections */}
                    {selected.id === "custom" ? (
                      <div>
                        <label className="block text-sm mb-2" style={{ color: T.textSub }}>Métricas incluídas</label>
                        <div className="grid grid-cols-2 gap-2">
                          {ALL_METRICS.map(m => (
                            <label key={m} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer" style={{ background: T.panel }}>
                              <input type="checkbox"
                                checked={customSections.includes(m)}
                                onChange={e => setCustomSections(prev => e.target.checked ? [...prev, m] : prev.filter(x => x !== m))} />
                              <span className="text-xs" style={{ color: T.textSub }}>{m}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm mb-2" style={{ color: T.textSub }}>Seções incluídas</label>
                        <div className="space-y-1.5">
                          {selected.sections.map((s, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg" style={{ background: T.panel }}>
                              <CheckCircle size={13} style={{ color: T.success }} />
                              <span style={{ color: T.textSub }}>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Proof chain badge */}
                {selected.id === "proof" && (
                  <div className="rounded-xl border p-4 flex items-center gap-3"
                    style={{ background: T.success + "08", borderColor: T.success + "25" }}>
                    <Shield size={18} style={{ color: T.success }} />
                    <div>
                      <div className="font-bold text-sm" style={{ color: T.success }}>Certificação ICP-Brasil incluída</div>
                      <div className="text-xs" style={{ color: T.textSub }}>Assinatura digital válida juridicamente + âncora Polygon</div>
                    </div>
                  </div>
                )}

                <button onClick={startGenerate}
                  className="w-full py-4 rounded-xl font-black text-sm transition-all hover:opacity-90"
                  style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff" }}>
                  Gerar {FORMAT_INFO[format].icon} Relatório em {FORMAT_INFO[format].label}
                </button>
              </>
            )}

            {state === "generating" && (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ background: T.primary + "15", border: `2px solid ${T.primary}30` }}>
                  <Loader size={32} style={{ color: T.primary }} className="animate-spin" />
                </div>
                <h3 className="font-black text-xl mb-2">Gerando relatório...</h3>
                <p className="text-sm mb-8" style={{ color: T.textSub }}>
                  {progress < 30 ? "Coletando dados de exibição..." : progress < 60 ? "Processando métricas..." : progress < 90 ? "Aplicando assinaturas..." : "Finalizando..."}
                </p>
                <div className="max-w-xs mx-auto">
                  <div className="h-2 rounded-full mb-2" style={{ background: T.border }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${T.primary}, ${T.success})` }} />
                  </div>
                  <div className="text-sm font-bold" style={{ color: T.primary }}>{progress}%</div>
                </div>
              </div>
            )}

            {state === "done" && (
              <div className="space-y-4">
                <div className="rounded-2xl border p-8 text-center" style={{ background: `linear-gradient(135deg, ${T.success}10, ${T.success}05)`, borderColor: T.success + "25" }}>
                  <div className="text-5xl mb-4">{FORMAT_INFO[format].icon}</div>
                  <h3 className="font-black text-2xl mb-2" style={{ color: T.success }}>Relatório pronto!</h3>
                  <p className="text-sm mb-1" style={{ color: T.textSub }}>{selected.name}</p>
                  <p className="text-xs" style={{ color: T.textSub }}>
                    {format === "pdf" ? "12 páginas · 1.8 MB" : "4.200 linhas · 340 KB"} · Gerado agora
                  </p>
                  {selected.id === "proof" && (
                    <div className="flex items-center justify-center gap-2 mt-3 text-xs" style={{ color: T.success }}>
                      <Shield size={12} /> Assinado digitalmente com ICP-Brasil
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Download", icon: Download, color: T.primary, primary: true },
                    { label: "Visualizar", icon: Eye, color: T.textSub },
                    { label: "Compartilhar", icon: Share2, color: T.textSub },
                  ].map((a, i) => (
                    <button key={i}
                      className="flex flex-col items-center gap-2 py-4 rounded-xl border transition-all hover:opacity-90"
                      style={{
                        background: a.primary ? T.primary : T.card,
                        borderColor: a.primary ? T.primary : T.border,
                        color: a.primary ? "#fff" : a.color,
                      }}>
                      <a.icon size={18} />
                      <span className="text-xs font-bold">{a.label}</span>
                    </button>
                  ))}
                </div>
                <button onClick={() => { reset(); setSelected(null); }}
                  className="w-full py-3 rounded-xl text-sm border hover:bg-white/5 transition-all"
                  style={{ borderColor: T.border, color: T.textSub }}>
                  Gerar outro relatório
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
