import { useState } from "react";
import {
  ArrowLeft, TrendingUp, TrendingDown, Eye, DollarSign,
  Clock, Target, Zap, Download, ChevronRight, BarChart2,
  CheckCircle, AlertCircle, Calendar, MapPin, Play
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, PieChart, Pie
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Campaign {
  id: string;
  name: string;
  advertiser: string;
  status: "active" | "paused" | "completed" | "draft";
  budget: number;
  spent: number;
  impressions: number;
  target: number;
  cpm: number;
  startDate: string;
  endDate: string;
  screens: number;
  segment: string;
  creative: string;
}

const CAMPAIGNS: Campaign[] = [
  { id: "cp1", name: "Black Friday 2026",      advertiser: "TechStore Brasil", status: "active",    budget: 8400,  spent: 3120, impressions: 84200,  target: 180000, cpm: 46, startDate: "01/11", endDate: "30/11", screens: 3, segment: "Varejo",      creative: "30s vídeo" },
  { id: "cp2", name: "Campanha iFood Verão",   advertiser: "iFood S.A.",       status: "active",    budget: 4800,  spent: 1840, impressions: 51200,  target: 120000, cpm: 40, startDate: "01/07", endDate: "31/07", screens: 2, segment: "Restaurante", creative: "15s vídeo" },
  { id: "cp3", name: "AutoFinance Julho",      advertiser: "AutoFinance SA",   status: "active",    budget: 2400,  spent: 2280, impressions: 61800,  target: 62000,  cpm: 42, startDate: "01/07", endDate: "31/07", screens: 1, segment: "Finanças",    creative: "Static"   },
  { id: "cp4", name: "FitPlus Trial",          advertiser: "FitPlus Gym",      status: "paused",    budget: 480,   spent: 320,  impressions: 9400,   target: 12000,  cpm: 38, startDate: "16/07", endDate: "23/07", screens: 1, segment: "Academia",    creative: "15s vídeo" },
  { id: "cp5", name: "Bradesco Conta Digital", advertiser: "Banco Bradesco",   status: "draft",     budget: 22000, spent: 0,    impressions: 0,      target: 520000, cpm: 52, startDate: "01/09", endDate: "30/09", screens: 2, segment: "Finanças",    creative: "30s vídeo" },
  { id: "cp6", name: "Drogaria São Paulo Jun", advertiser: "Drogaria SP",      status: "completed", budget: 1800,  spent: 1800, impressions: 47200,  target: 45000,  cpm: 40, startDate: "01/06", endDate: "30/06", screens: 1, segment: "Farmácia",    creative: "Static"   },
];

const mkHourly = () => Array.from({ length: 24 }, (_, h) => ({
  h: `${String(h).padStart(2, "0")}h`,
  imp: Math.round(300 + Math.random() * 1400 * (h >= 8 && h <= 21 ? 1 : 0.15)),
  cpm: parseFloat((38 + Math.random() * 14).toFixed(1)),
}));

const mkDaily = () => ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(d => ({
  d,
  imp: Math.round(8000 + Math.random() * 14000),
  rev: parseFloat((340 + Math.random() * 520).toFixed(0)),
}));

const SCREEN_BREAKDOWN = [
  { name: "Recepção Principal",  imp: 34200, pct: 41 },
  { name: "Vitrine Shopping",    imp: 28800, pct: 34 },
  { name: "Área de Checkout",    imp: 21200, pct: 25 },
];

const STATUS_CFG = {
  active:    { label: "Ativa",      color: T.success, bg: T.success + "15" },
  paused:    { label: "Pausada",    color: T.warning, bg: T.warning + "15" },
  completed: { label: "Concluída",  color: T.primary, bg: T.primary + "15" },
  draft:     { label: "Rascunho",   color: T.textSub, bg: T.border },
};

function KPI({ label, value, sub, color = T.text }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
      <p className="text-xs mb-1" style={{ color: T.textSub }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: T.textSub }}>{sub}</p>}
    </div>
  );
}

export default function CampaignAnalytics({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (v: string) => void }) {
  const [selected, setSelected] = useState<Campaign | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const hourly = mkHourly();
  const daily  = mkDaily();

  const visible = filterStatus === "all" ? CAMPAIGNS : CAMPAIGNS.filter(c => c.status === filterStatus);

  if (selected) {
    const cfg = STATUS_CFG[selected.status];
    const progress = Math.min(100, (selected.impressions / selected.target) * 100);
    const budgetPct = Math.min(100, (selected.spent / selected.budget) * 100);

    return (
      <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
        <div className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10" style={{ background: T.panel, borderColor: T.border }}>
          <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-white/5">
            <ArrowLeft size={18} style={{ color: T.textSub }} />
          </button>
          <div>
            <h1 className="font-bold">{selected.name}</h1>
            <p className="text-xs" style={{ color: T.textSub }}>{selected.advertiser}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" style={{ background: T.border, color: T.textSub }}>
              <Download size={13} /> Exportar
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPI label="Impressões"  value={selected.impressions.toLocaleString("pt-BR")} sub={`meta: ${selected.target.toLocaleString("pt-BR")}`} color={T.text} />
            <KPI label="CPM médio"   value={`R$${selected.cpm}`} sub="custo por mil" color={T.primary} />
            <KPI label="Gasto"       value={`R$${selected.spent.toLocaleString("pt-BR")}`} sub={`de R$${selected.budget.toLocaleString("pt-BR")}`} color={T.warning} />
            <KPI label="Progresso"   value={`${progress.toFixed(1)}%`} sub="das impressões" color={progress >= 100 ? T.success : T.text} />
          </div>

          {/* Progress bars */}
          <div className="p-6 rounded-2xl border space-y-4" style={{ background: T.card, borderColor: T.border }}>
            <div>
              <div className="flex justify-between text-xs mb-2" style={{ color: T.textSub }}>
                <span>Impressões entregues</span><span>{progress.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: T.border }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, background: progress >= 100 ? T.success : T.primary }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2" style={{ color: T.textSub }}>
                <span>Budget utilizado</span><span>{budgetPct.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: T.border }}>
                <div className="h-2 rounded-full transition-all" style={{ width: `${budgetPct}%`, background: budgetPct > 90 ? T.danger : T.warning }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hourly */}
            <div className="p-6 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold text-sm mb-4">Impressões por hora (hoje)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={hourly}>
                  <XAxis dataKey="h" tick={{ fontSize: 9, fill: T.textSub }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }}
                    formatter={(v: number) => [v.toLocaleString("pt-BR"), "Impressões"]} />
                  <Bar key="bar-imp" dataKey="imp" radius={[3, 3, 0, 0]}>
                    {hourly.map((_, i) => <Cell key={`ca-cell-${i}`} fill={i >= 8 && i <= 21 ? T.primary : T.border} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Screen breakdown */}
            <div className="p-6 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold text-sm mb-4">Por tela</h3>
              <div className="space-y-3">
                {SCREEN_BREAKDOWN.map((s, i) => (
                  <div key={`sb-${i}`}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{s.name}</span>
                      <span style={{ color: T.textSub }}>{s.imp.toLocaleString("pt-BR")} imp · {s.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: T.border }}>
                      <div className="h-1.5 rounded-full" style={{ width: `${s.pct}%`, background: [T.primary, T.accent, T.success][i] }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <ResponsiveContainer width="100%" height={100}>
                  <PieChart>
                    <Pie key="pie-pct" data={SCREEN_BREAKDOWN} dataKey="pct" nameKey="name" cx="50%" cy="50%" innerRadius={25} outerRadius={42}>
                      {SCREEN_BREAKDOWN.map((_, i) => <Cell key={`ca-pie-${i}`} fill={[T.primary, T.accent, T.success][i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Weekly trend */}
          <div className="p-6 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <h3 className="font-bold text-sm mb-4">Tendência semanal — impressões e receita</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={daily}>
                <defs>
                  <linearGradient key="ca-imp-grad" id="ca-imp-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={T.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="d" tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }} />
                <Area key="area-imp" type="monotone" dataKey="imp" stroke={T.primary} fill="url(#ca-imp-grad)" strokeWidth={2} name="Impressões" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Campaign details */}
          <div className="p-6 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <h3 className="font-bold text-sm mb-4">Detalhes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                ["Período",    `${selected.startDate} → ${selected.endDate}`],
                ["Telas",      `${selected.screens} ativa${selected.screens > 1 ? "s" : ""}`],
                ["Segmento",   selected.segment],
                ["Criativo",   selected.creative],
                ["CPM alvo",   `R$${selected.cpm}`],
                ["Anunciante", selected.advertiser],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl" style={{ background: T.panel }}>
                  <p className="text-xs mb-1" style={{ color: T.textSub }}>{k}</p>
                  <p className="font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10" style={{ background: T.panel, borderColor: T.border }}>
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
          <ArrowLeft size={18} style={{ color: T.textSub }} />
        </button>
        <div>
          <h1 className="font-bold text-lg">Analytics por Campanha</h1>
          <p className="text-xs" style={{ color: T.textSub }}>{CAMPAIGNS.length} campanhas</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {["all","active","paused","completed"].map(s => (
            <button key={s}
              onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: filterStatus === s ? T.primary + "20" : T.border, color: filterStatus === s ? T.primary : T.textSub }}
            >
              {s === "all" ? "Todas" : STATUS_CFG[s as keyof typeof STATUS_CFG]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPI label="Ativas"         value={String(CAMPAIGNS.filter(c => c.status === "active").length)}  color={T.success} />
          <KPI label="Impressões totais" value={CAMPAIGNS.reduce((s,c) => s + c.impressions,0).toLocaleString("pt-BR")} color={T.text} />
          <KPI label="Receita total"  value={`R$${CAMPAIGNS.reduce((s,c) => s + c.spent,0).toLocaleString("pt-BR")}`} color={T.warning} />
          <KPI label="CPM médio"      value="R$43,2" color={T.primary} />
        </div>

        {/* Campaign cards */}
        <div className="space-y-3">
          {visible.map(c => {
            const cfg = STATUS_CFG[c.status];
            const pct = Math.min(100, (c.impressions / c.target) * 100);
            return (
              <button key={c.id} onClick={() => setSelected(c)}
                className="w-full p-5 rounded-2xl border text-left transition-all hover:border-opacity-60"
                style={{ background: T.card, borderColor: T.border }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{c.name}</p>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold shrink-0" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: T.textSub }}>{c.advertiser} · {c.segment} · {c.screens} tela{c.screens > 1 ? "s" : ""}</p>

                    <div className="flex items-center gap-1 mt-3">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: T.border }}>
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? T.success : T.primary }} />
                      </div>
                      <span className="text-xs ml-2 shrink-0" style={{ color: T.textSub }}>{pct.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="hidden md:flex items-center gap-6 text-xs shrink-0">
                    <div className="text-center">
                      <p className="font-bold text-base">{c.impressions.toLocaleString("pt-BR")}</p>
                      <p style={{ color: T.textSub }}>Impressões</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-base" style={{ color: T.warning }}>R${c.spent.toLocaleString("pt-BR")}</p>
                      <p style={{ color: T.textSub }}>Gasto</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-base" style={{ color: T.primary }}>R${c.cpm}</p>
                      <p style={{ color: T.textSub }}>CPM</p>
                    </div>
                    <ChevronRight size={16} style={{ color: T.textSub }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
