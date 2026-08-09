import { useState } from "react";
import {
  ArrowLeft, Download, FileText, Database, Clock, CheckCircle,
  RefreshCw, Calendar, Filter, ChevronDown, Zap, Table, FileJson,
  Sheet, Plus, Trash2, Play, BarChart2
} from "lucide-react";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type ExportFormat = "csv" | "xlsx" | "json" | "pdf";
type ExportStatus = "ready" | "processing" | "scheduled";

interface ExportJob {
  id: string;
  name: string;
  dataset: string;
  format: ExportFormat;
  period: string;
  size: string;
  rows: number;
  createdAt: string;
  status: ExportStatus;
  recurring?: string;
}

const FORMAT_COLOR: Record<ExportFormat, string> = {
  csv: T.success, xlsx: T.primary, json: T.accent, pdf: T.danger,
};
const FORMAT_ICON: Record<ExportFormat, any> = {
  csv: Table, xlsx: Sheet, json: FileJson, pdf: FileText,
};

const DATASETS = [
  { id: "campaigns",     label: "Campanhas",             desc: "Campanhas, orçamento, CPM, impressões", icon: Zap },
  { id: "screens",       label: "Telas",                 desc: "Inventário, localização, status, uptime", icon: BarChart2 },
  { id: "impressions",   label: "Impressões",            desc: "Log de cada exibição com timestamp e tela", icon: Database },
  { id: "revenue",       label: "Receita",               desc: "MRR, ARR, pagamentos, churn", icon: CheckCircle },
  { id: "audience",      label: "Audiência",             desc: "Fluxo, dwell time, segmentos", icon: Filter },
  { id: "proofchain",    label: "ProofChain",            desc: "Hashes RSA-SHA256 e registros Polygon", icon: Database },
  { id: "partners",      label: "Parceiros",             desc: "Comissões, tier, indicações, MRR", icon: CheckCircle },
  { id: "contracts",     label: "Contratos",             desc: "Vigência, valor, assinatura digital", icon: FileText },
];

const JOBS: ExportJob[] = [
  { id: "j1", name: "Relatório Mensal Jul/2026",  dataset: "revenue",    format: "pdf",  period: "Jul 2026",      size: "2.8 MB", rows: 0,       createdAt: "23/07 09:00", status: "ready" },
  { id: "j2", name: "Log de Impressões — 7 dias", dataset: "impressions",format: "csv",  period: "17–23/07/2026", size: "48 MB",  rows: 312400,  createdAt: "23/07 08:30", status: "ready" },
  { id: "j3", name: "Inventário de Telas",         dataset: "screens",   format: "xlsx", period: "Atual",         size: "320 KB", rows: 127,     createdAt: "22/07 18:00", status: "ready" },
  { id: "j4", name: "ProofChain Hash Export",      dataset: "proofchain",format: "json", period: "Jun 2026",      size: "12 MB",  rows: 88200,   createdAt: "01/07 00:05", status: "ready" },
  { id: "j5", name: "Relatório de Parceiros",      dataset: "partners",  format: "xlsx", period: "Q2 2026",       size: "180 KB", rows: 8,       createdAt: "22/07 14:00", status: "ready" },
  { id: "j6", name: "Backup Diário — Campanhas",   dataset: "campaigns", format: "json", period: "Diário",        size: "—",      rows: 0,       createdAt: "23/07 03:00", status: "scheduled", recurring: "Diário 03:00" },
  { id: "j7", name: "Relatório Semanal Receita",   dataset: "revenue",   format: "pdf",  period: "Semanal",       size: "—",      rows: 0,       createdAt: "Seg 09:00",   status: "scheduled", recurring: "Seg 09:00" },
];

const PERIODS = ["Hoje", "Últimos 7 dias", "Últimos 30 dias", "Este mês", "Mês anterior", "Q2 2026", "Q1 2026", "2025 completo", "Personalizado"];
const FORMATS: ExportFormat[] = ["csv", "xlsx", "json", "pdf"];

export default function DataExport({ onBack, onNavigate }: Props) {
  const [jobs, setJobs]           = useState<ExportJob[]>(JOBS);
  const [tab, setTab]             = useState<"history" | "new" | "scheduled">("history");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  // New export form
  const [selDataset, setSelDataset] = useState("campaigns");
  const [selFormat, setSelFormat]   = useState<ExportFormat>("csv");
  const [selPeriod, setSelPeriod]   = useState("Últimos 30 dias");
  const [selFields, setSelFields]   = useState<string[]>(["id","name","budget","cpm","impressions","status"]);
  const [exportName, setExportName] = useState("");

  const allFields: Record<string, string[]> = {
    campaigns:   ["id","name","advertiser","budget","cpm","impressions","plays","start","end","status","screens"],
    screens:     ["id","name","city","lat","lng","resolution","uptime","temperature","signal","status"],
    impressions: ["id","screen_id","campaign_id","timestamp","duration","hash","block"],
    revenue:     ["date","mrr","arr","new_mrr","churned_mrr","net_new_mrr","paying_clients"],
    audience:    ["date","screen_id","daily_traffic","dwell_time","frequency","cpm_effective"],
    proofchain:  ["timestamp","screen_id","campaign_id","hash_rsa","merkle_root","polygon_tx","tsa"],
    partners:    ["id","name","city","tier","screens","mrr","commission","refs","status"],
    contracts:   ["id","title","client","cnpj","value","start","end","status","hash"],
  };

  function toggleField(f: string) {
    setSelFields(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  }

  function generateExport() {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
      const newJob: ExportJob = {
        id: `j${Date.now()}`,
        name: exportName || `${DATASETS.find(d=>d.id===selDataset)?.label} — ${selPeriod}`,
        dataset: selDataset,
        format: selFormat,
        period: selPeriod,
        size: `${(Math.random() * 10 + 0.5).toFixed(1)} MB`,
        rows: Math.floor(Math.random() * 50000 + 500),
        createdAt: "agora",
        status: "ready",
      };
      setJobs(prev => [newJob, ...prev]);
      setTimeout(() => { setTab("history"); setGenerated(false); }, 800);
    }, 2000);
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <Download size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Exportação de Dados</h1>
                <p className="text-xs" style={{ color: T.textSub }}>CSV · XLSX · JSON · PDF — todos os datasets</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["history","new","scheduled"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.accent + "20" : "transparent", color: tab === t ? T.accent : T.textSub, border: `1px solid ${tab === t ? T.accent + "30" : "transparent"}` }}>
                {t === "history" ? "Histórico" : t === "new" ? "+ Nova Exportação" : "Agendadas"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">

        {/* HISTORY */}
        {tab === "history" && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 mb-2">
              {[
                { label: "Exportações este mês", value: jobs.filter(j=>j.status==="ready").length, color: T.accent },
                { label: "Agendadas",            value: jobs.filter(j=>j.status==="scheduled").length, color: T.gold },
                { label: "Total exportado",      value: "~64 MB",   color: T.success },
                { label: "Datasets disponíveis", value: DATASETS.length, color: T.primary },
              ].map((k, i) => (
                <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
              <div className="p-4" style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
                <h3 className="font-black">Exportações Recentes</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: T.panel, borderBottom: `1px solid ${T.border}` }}>
                    {["Nome","Dataset","Formato","Período","Tamanho","Registros","Criado em","Ação"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold" style={{ color: T.textSub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {jobs.filter(j => j.status === "ready").map(job => {
                    const FmtIcon = FORMAT_ICON[job.format];
                    const ds = DATASETS.find(d => d.id === job.dataset);
                    return (
                      <tr key={job.id} className="border-b hover:bg-white/3" style={{ borderColor: T.border + "60" }}>
                        <td className="px-4 py-3 font-bold text-xs">{job.name}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: T.textSub }}>{ds?.label}</td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-xs font-black uppercase"
                            style={{ color: FORMAT_COLOR[job.format] }}>
                            <FmtIcon size={11} />{job.format}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: T.textSub }}>{job.period}</td>
                        <td className="px-4 py-3 text-xs font-mono">{job.size}</td>
                        <td className="px-4 py-3 text-xs">{job.rows > 0 ? job.rows.toLocaleString("pt-BR") : "—"}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: T.textSub }}>{job.createdAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold"
                              style={{ background: T.success + "15", color: T.success }}>
                              <Download size={11} /> Baixar
                            </button>
                            <button onClick={() => setJobs(prev => prev.filter(j => j.id !== job.id))}
                              className="p-1.5 rounded-lg hover:bg-white/5">
                              <Trash2 size={11} style={{ color: T.danger }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NEW EXPORT */}
        {tab === "new" && (
          <div className="grid grid-cols-5 gap-6">
            <div className="col-span-3 space-y-5">
              {/* Dataset */}
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-4">1. Selecionar Dataset</h3>
                <div className="grid grid-cols-2 gap-2">
                  {DATASETS.map(ds => (
                    <button key={ds.id} onClick={() => { setSelDataset(ds.id); setSelFields(allFields[ds.id]?.slice(0,6) || []); }}
                      className="p-3 rounded-xl text-left transition-all flex items-start gap-2"
                      style={{ background: selDataset === ds.id ? T.accent + "20" : T.panel, border: `1px solid ${selDataset === ds.id ? T.accent + "40" : T.border}` }}>
                      <ds.icon size={14} style={{ color: selDataset === ds.id ? T.accent : T.textSub, flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <div className="text-xs font-black" style={{ color: selDataset === ds.id ? T.accent : T.text }}>{ds.label}</div>
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{ds.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Period */}
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-3">2. Período</h3>
                <div className="flex flex-wrap gap-2">
                  {PERIODS.map(p => (
                    <button key={p} onClick={() => setSelPeriod(p)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: selPeriod === p ? T.primary + "20" : T.panel, color: selPeriod === p ? T.primary : T.textSub, border: `1px solid ${selPeriod === p ? T.primary + "30" : T.border}` }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fields */}
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-3">3. Colunas</h3>
                <div className="flex flex-wrap gap-2">
                  {(allFields[selDataset] || []).map(f => (
                    <button key={f} onClick={() => toggleField(f)}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all"
                      style={{ background: selFields.includes(f) ? T.gold + "20" : T.panel, color: selFields.includes(f) ? T.gold : T.textSub, border: `1px solid ${selFields.includes(f) ? T.gold + "30" : T.border}` }}>
                      {f}
                    </button>
                  ))}
                </div>
                <div className="text-xs mt-2" style={{ color: T.textSub }}>{selFields.length} colunas selecionadas</div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="col-span-2 space-y-4">
              {/* Format */}
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-3">4. Formato</h3>
                <div className="grid grid-cols-2 gap-2">
                  {FORMATS.map(fmt => {
                    const Icon = FORMAT_ICON[fmt];
                    return (
                      <button key={fmt} onClick={() => setSelFormat(fmt)}
                        className="py-3 rounded-xl font-black text-sm uppercase flex items-center justify-center gap-2 transition-all"
                        style={{ background: selFormat === fmt ? FORMAT_COLOR[fmt] + "25" : T.panel, color: selFormat === fmt ? FORMAT_COLOR[fmt] : T.textSub, border: `1px solid ${selFormat === fmt ? FORMAT_COLOR[fmt] + "40" : T.border}` }}>
                        <Icon size={14} />{fmt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name */}
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black text-sm mb-3">5. Nome (opcional)</h3>
                <input value={exportName} onChange={e => setExportName(e.target.value)}
                  placeholder={`${DATASETS.find(d=>d.id===selDataset)?.label} — ${selPeriod}`}
                  className="w-full px-3 py-2 rounded-xl text-sm"
                  style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
              </div>

              {/* Summary */}
              <div className="p-4 rounded-2xl border" style={{ background: T.panel, borderColor: T.border }}>
                <div className="text-xs font-bold mb-2" style={{ color: T.textSub }}>RESUMO</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span style={{ color: T.textSub }}>Dataset</span>
                    <span className="font-bold">{DATASETS.find(d=>d.id===selDataset)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: T.textSub }}>Formato</span>
                    <span className="font-bold uppercase" style={{ color: FORMAT_COLOR[selFormat] }}>{selFormat}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: T.textSub }}>Período</span>
                    <span className="font-bold">{selPeriod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: T.textSub }}>Colunas</span>
                    <span className="font-bold">{selFields.length}</span>
                  </div>
                </div>
              </div>

              <button onClick={generateExport} disabled={generating || generated}
                className="w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all"
                style={{ background: generated ? T.success : `linear-gradient(135deg,${T.accent},${T.primary})`, color: generated ? "#000" : "#fff", opacity: generating ? 0.8 : 1 }}>
                {generating ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: "spin 0.6s linear infinite" }} /> Gerando...</>
                ) : generated ? (
                  <><CheckCircle size={18} /> Pronto! Baixando...</>
                ) : (
                  <><Download size={18} /> Gerar Exportação</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* SCHEDULED */}
        {tab === "scheduled" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black">Exportações Agendadas</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.primary, color: "#fff" }}>
                <Plus size={14} /> Novo Agendamento
              </button>
            </div>
            {jobs.filter(j => j.status === "scheduled").map(job => {
              const FmtIcon = FORMAT_ICON[job.format];
              const ds = DATASETS.find(d => d.id === job.dataset);
              return (
                <div key={job.id} className="p-5 rounded-2xl border flex items-center justify-between"
                  style={{ background: T.card, borderColor: T.border }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: FORMAT_COLOR[job.format] + "20" }}>
                      <FmtIcon size={18} style={{ color: FORMAT_COLOR[job.format] }} />
                    </div>
                    <div>
                      <div className="font-black">{job.name}</div>
                      <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: T.textSub }}>
                        <span>{ds?.label}</span>
                        <span>·</span>
                        <Clock size={10} className="inline" />
                        <span>{job.recurring}</span>
                        <span className="font-black uppercase" style={{ color: FORMAT_COLOR[job.format] }}>{job.format}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: T.gold + "20", color: T.gold }}>
                      Agendado
                    </span>
                    <button className="p-1.5 rounded-lg hover:bg-white/5">
                      <Play size={13} style={{ color: T.success }} />
                    </button>
                    <button onClick={() => setJobs(prev => prev.filter(j => j.id !== job.id))}
                      className="p-1.5 rounded-lg hover:bg-white/5">
                      <Trash2 size={13} style={{ color: T.danger }} />
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: T.card, border: `1px solid ${T.border}` }}>
              <Zap size={15} style={{ color: T.gold, flexShrink: 0, marginTop: 1 }} />
              <div className="text-xs" style={{ color: T.textSub }}>
                Exportações agendadas são entregues via e-mail ou webhook configurado nas integrações. Formatos grandes (&gt;50 MB) ficam disponíveis por 7 dias no histórico.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
