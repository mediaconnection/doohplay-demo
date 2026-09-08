import { useState } from "react";
import {
  ArrowLeft, FileText, Plus, Trash2, Download, Play, Eye,
  BarChart2, TrendingUp, Users, DollarSign, Monitor, Clock,
  ChevronRight, X, CheckCircle, RefreshCw, Grid, List, Zap,
  GripVertical, Copy, Share2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, LineChart, Line
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type MetricType = "impressions" | "ctr" | "cpm" | "revenue" | "screens" | "leads" | "occupancy" | "conversions";
type ChartType = "area" | "bar" | "line" | "pie" | "table" | "kpi";
type ReportStatus = "draft" | "published" | "scheduled";

interface Metric {
  id: MetricType;
  label: string;
  icon: any;
  color: string;
  unit?: string;
  format?: "currency" | "percent" | "number";
}

interface ReportBlock {
  id: string;
  title: string;
  metric: MetricType;
  chartType: ChartType;
}

interface SavedReport {
  id: string;
  name: string;
  blocks: number;
  status: ReportStatus;
  period: string;
  lastRun: string;
  owner: string;
}

const METRICS: Metric[] = [
  { id: "impressions",  label: "Impressões",    icon: Eye,        color: T.primary,  format: "number"   },
  { id: "ctr",          label: "CTR",           icon: TrendingUp, color: T.success,  format: "percent", unit: "%" },
  { id: "cpm",          label: "CPM",           icon: DollarSign, color: T.gold,     format: "currency" },
  { id: "revenue",      label: "Receita",       icon: BarChart2,  color: T.success,  format: "currency" },
  { id: "screens",      label: "Telas Ativas",  icon: Monitor,    color: T.accent,   format: "number"   },
  { id: "leads",        label: "Leads",         icon: Users,      color: T.warning,  format: "number"   },
  { id: "occupancy",    label: "Ocupação",      icon: Grid,       color: T.primary,  format: "percent", unit: "%" },
  { id: "conversions",  label: "Conversões",    icon: CheckCircle,color: T.gold,     format: "number"   },
];

const CHART_TYPES: { id: ChartType; label: string; icon: any }[] = [
  { id: "kpi",   label: "KPI Card",  icon: Zap       },
  { id: "area",  label: "Área",      icon: TrendingUp },
  { id: "bar",   label: "Barras",    icon: BarChart2  },
  { id: "line",  label: "Linha",     icon: TrendingUp },
  { id: "pie",   label: "Pizza",     icon: Grid       },
  { id: "table", label: "Tabela",    icon: List       },
];

const SAVED_REPORTS: SavedReport[] = [
  { id: "R1", name: "Resumo Executivo Mensal",    blocks: 6, status: "published", period: "Jul 2025", lastRun: "23/07 06:00", owner: "Carlos M." },
  { id: "R2", name: "Performance de Campanhas",   blocks: 4, status: "published", period: "Últimos 30d", lastRun: "23/07 08:30", owner: "Ana Costa" },
  { id: "R3", name: "Ocupação de Telas — SP",    blocks: 3, status: "scheduled", period: "Semanal",   lastRun: "22/07 07:00", owner: "DOOHPLAY" },
  { id: "R4", name: "ROI por Anunciante Q3",      blocks: 5, status: "draft",     period: "Q3 2025",   lastRun: "—",          owner: "Juliana P." },
  { id: "R5", name: "Lead Capture Analytics",    blocks: 4, status: "published", period: "Últimos 7d", lastRun: "23/07 09:00", owner: "Bia Santos" },
];

const STATUS_META: Record<ReportStatus, { label: string; color: string }> = {
  draft:     { label: "Rascunho",  color: T.textSub },
  published: { label: "Publicado", color: T.success  },
  scheduled: { label: "Agendado",  color: T.warning  },
};

const DEMO_AREA_DATA = Array.from({ length: 7 }, (_, i) => ({
  day: ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"][i],
  value: [120000, 145000, 132000, 168000, 182000, 94000, 78000][i],
}));

const DEMO_BAR_DATA = [
  { name: "Ambev",     value: 58000, color: T.primary },
  { name: "Bradesco",  value: 42000, color: T.accent  },
  { name: "iFood",     value: 71000, color: T.success },
  { name: "Carrefour", value: 33000, color: T.gold    },
  { name: "Unilever",  value: 45000, color: T.warning },
];

const DEMO_PIE_DATA = [
  { name: "Indoor",   value: 35, color: T.primary },
  { name: "Outdoor",  value: 28, color: T.success },
  { name: "Trânsito", value: 22, color: T.accent  },
  { name: "Retail",   value: 15, color: T.gold    },
];

const KPI_VALUES: Record<MetricType, { value: string; delta: string; positive: boolean }> = {
  impressions: { value: "4.2M",      delta: "+18%",  positive: true  },
  ctr:         { value: "3.4%",      delta: "+0.6pp",positive: true  },
  cpm:         { value: "R$47",      delta: "+R$3",  positive: false },
  revenue:     { value: "R$124k",    delta: "+22%",  positive: true  },
  screens:     { value: "168",       delta: "+14",   positive: true  },
  leads:       { value: "2,390",     delta: "+310",  positive: true  },
  occupancy:   { value: "82%",       delta: "+4pp",  positive: true  },
  conversions: { value: "3,100",     delta: "+280",  positive: true  },
};

function BlockPreview({ block }: { block: ReportBlock }) {
  const metric = METRICS.find(m => m.id === block.metric)!;
  const kpi    = KPI_VALUES[block.metric];
  const gradId = `grad-block-${block.id}`;

  if (block.chartType === "kpi") {
    const Icon = metric.icon;
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Icon size={22} style={{ color: metric.color, marginBottom: 6 }} />
        <div className="font-black text-2xl" style={{ color: metric.color }}>{kpi.value}</div>
        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{metric.label}</div>
        <div className="text-xs font-bold mt-1" style={{ color: kpi.positive ? T.success : T.danger }}>{kpi.delta} vs. mês ant.</div>
      </div>
    );
  }

  if (block.chartType === "area") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={DEMO_AREA_DATA} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metric.color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }} />
          <Area key={`area-${block.id}`} type="monotone" dataKey="value" stroke={metric.color} fill={`url(#${gradId})`} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (block.chartType === "bar") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={DEMO_BAR_DATA} barSize={18} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }} />
          <Bar key={`bar-${block.id}`} dataKey="value" radius={[4, 4, 0, 0]}>
            {DEMO_BAR_DATA.map((entry, i) => (
              <Cell key={`cell-${block.id}-${i}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (block.chartType === "pie") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie key={`pie-${block.id}`} data={DEMO_PIE_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3}>
            {DEMO_PIE_DATA.map((entry, i) => (
              <Cell key={`cell-pi-${block.id}-${i}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (block.chartType === "line") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={DEMO_AREA_DATA} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }} />
          <Line key={`line-${block.id}`} type="monotone" dataKey="value" stroke={metric.color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (block.chartType === "table") {
    return (
      <div className="p-3 overflow-auto h-full">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              {["Campanha","Valor","Delta"].map(h => (
                <th key={h} className="text-left pb-1.5 font-bold" style={{ color: T.textSub }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEMO_BAR_DATA.map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${T.border}30` }}>
                <td className="py-1.5 font-bold">{row.name}</td>
                <td style={{ color: row.color }}>{row.value.toLocaleString("pt-BR")}</td>
                <td style={{ color: T.success }}>+{(i + 1) * 4}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <div className="flex items-center justify-center h-full text-xs" style={{ color: T.textSub }}>Preview indisponível</div>;
}

export default function ReportBuilder({ onBack, onNavigate }: Props) {
  const [tab, setTab]             = useState<"builder" | "saved">("saved");
  const [blocks, setBlocks]       = useState<ReportBlock[]>([
    { id: "b1", title: "Impressões Semanais",  metric: "impressions", chartType: "area" },
    { id: "b2", title: "Receita por Anunciante", metric: "revenue",   chartType: "bar" },
    { id: "b3", title: "CTR Geral",             metric: "ctr",        chartType: "kpi" },
    { id: "b4", title: "Mix por Tipo de Tela",  metric: "occupancy",  chartType: "pie" },
  ]);
  const [reportName, setReportName] = useState("Novo Relatório");
  const [period, setPeriod]        = useState("30d");

  function addBlock(metricId: MetricType, chartType: ChartType) {
    const metric = METRICS.find(m => m.id === metricId)!;
    setBlocks(b => [...b, {
      id: `b${Date.now()}`,
      title: `${metric.label} — ${CHART_TYPES.find(c => c.id === chartType)?.label}`,
      metric: metricId,
      chartType,
    }]);
  }

  function removeBlock(id: string) {
    setBlocks(b => b.filter(bl => bl.id !== id));
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
                <FileText size={18} style={{ color: T.gold }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Report Builder</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Construa relatórios customizados com métricas e visualizações</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["saved","builder"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.gold + "20" : "transparent", color: tab === t ? T.gold : T.textSub, border: `1px solid ${tab === t ? T.gold + "30" : "transparent"}` }}>
                {t === "saved" ? "Relatórios Salvos" : "Editor"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* SAVED TAB */}
        {tab === "saved" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black">Relatórios</h2>
              <button onClick={() => setTab("builder")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                style={{ background: T.gold, color: "#000" }}>
                <Plus size={14} /> Novo Relatório
              </button>
            </div>

            <div className="space-y-3">
              {SAVED_REPORTS.map(rep => {
                const sm = STATUS_META[rep.status];
                return (
                  <div key={rep.id} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: T.gold + "20" }}>
                        <FileText size={16} style={{ color: T.gold }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black">{rep.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: T.textSub }}>
                          <span>{rep.blocks} blocos</span>
                          <span>·</span>
                          <span>{rep.period}</span>
                          <span>·</span>
                          <span>Por {rep.owner}</span>
                          {rep.lastRun !== "—" && <><span>·</span><span>Gerado {rep.lastRun}</span></>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl hover:bg-white/5" style={{ background: T.panel }}>
                          <Eye size={14} style={{ color: T.textSub }} />
                        </button>
                        <button className="p-2 rounded-xl hover:bg-white/5" style={{ background: T.panel }}>
                          <Download size={14} style={{ color: T.textSub }} />
                        </button>
                        <button className="p-2 rounded-xl hover:bg-white/5" style={{ background: T.panel }}>
                          <Share2 size={14} style={{ color: T.textSub }} />
                        </button>
                        <button onClick={() => setTab("builder")}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                          Editar
                        </button>
                        {rep.status !== "draft" && (
                          <button className="px-3 py-1.5 rounded-xl text-xs font-black"
                            style={{ background: T.gold + "20", color: T.gold, border: `1px solid ${T.gold}30` }}>
                            <RefreshCw size={11} className="inline mr-1" />Gerar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* BUILDER TAB */}
        {tab === "builder" && (
          <div className="flex gap-6">
            {/* Left panel: metric selector */}
            <div className="w-64 flex-shrink-0 space-y-4">
              {/* Report settings */}
              <div className="p-4 rounded-2xl border space-y-3" style={{ background: T.card, borderColor: T.border }}>
                <div>
                  <label className="text-xs font-bold mb-1 block" style={{ color: T.textSub }}>NOME</label>
                  <input value={reportName} onChange={e => setReportName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block" style={{ color: T.textSub }}>PERÍODO</label>
                  <select value={period} onChange={e => setPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm"
                    style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                    {["7d","30d","90d","Personalizado"].map(p => <option key={p} value={p}>{p === "7d" ? "Últimos 7 dias" : p === "30d" ? "Últimos 30 dias" : p === "90d" ? "Últimos 90 dias" : p}</option>)}
                  </select>
                </div>
              </div>

              {/* Metrics */}
              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="text-xs font-bold mb-3" style={{ color: T.textSub }}>MÉTRICAS</div>
                <div className="space-y-1">
                  {METRICS.map(m => {
                    const Icon = m.icon;
                    return (
                      <div key={m.id} className="p-2 rounded-xl" style={{ background: T.panel }}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon size={12} style={{ color: m.color }} />
                          <span className="text-xs font-bold">{m.label}</span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {CHART_TYPES.slice(0, 4).map(ct => (
                            <button key={ct.id} onClick={() => addBlock(m.id, ct.id)}
                              className="text-xs px-1.5 py-0.5 rounded-lg transition-all hover:bg-white/10"
                              style={{ background: T.border, color: T.textSub }}>
                              +{ct.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: canvas */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-black">{reportName}</h2>
                  <span className="text-xs" style={{ color: T.textSub }}>{blocks.length} blocos · {period}</span>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                    <Eye size={13} /> Preview
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                    style={{ background: T.panel, color: T.textSub, border: `1px solid ${T.border}` }}>
                    <Download size={13} /> Exportar PDF
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                    style={{ background: T.gold, color: "#000" }}>
                    <CheckCircle size={13} /> Publicar
                  </button>
                </div>
              </div>

              {blocks.length === 0 ? (
                <div className="rounded-2xl border flex items-center justify-center" style={{ background: T.card, borderColor: T.border, height: 300 }}>
                  <div className="text-center">
                    <Plus size={32} className="mx-auto mb-3" style={{ color: T.border }} />
                    <p className="text-sm" style={{ color: T.textSub }}>Adicione blocos usando o painel de métricas à esquerda</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {blocks.map(block => {
                    const metric = METRICS.find(m => m.id === block.metric)!;
                    return (
                      <div key={block.id} className="rounded-2xl border overflow-hidden group" style={{ background: T.card, borderColor: T.border }}>
                        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: T.border }}>
                          <div className="flex items-center gap-2">
                            <GripVertical size={13} style={{ color: T.textSub }} className="cursor-grab" />
                            <span className="text-sm font-black">{block.title}</span>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 rounded-lg hover:bg-white/5">
                              {/* edit icon placeholder */}
                            </button>
                            <button onClick={() => removeBlock(block.id)} className="p-1.5 rounded-lg hover:bg-white/5">
                              <Trash2 size={12} style={{ color: T.danger }} />
                            </button>
                          </div>
                        </div>
                        <div style={{ height: block.chartType === "kpi" ? 120 : 180 }}>
                          <BlockPreview block={block} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
