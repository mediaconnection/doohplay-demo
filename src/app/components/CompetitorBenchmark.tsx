import { useState } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, BarChart2, Eye, DollarSign, Zap, Award, AlertCircle } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type Segment = "barbearia" | "academia" | "restaurante" | "farmacia" | "varejo";

interface Peer {
  id: string;
  label: string;
  fillRate: number;
  cpm: number;
  revenue: number;
  uptime: number;
  impressions: number;
  isMe?: boolean;
}

const SEGMENT_DATA: Record<Segment, { label: string; peers: Peer[]; insight: string }> = {
  barbearia: {
    label: "Barbearia",
    insight: "Seu CPM está 18% abaixo da média do segmento. Barbearias premium cobram R$48–R$54 no horário de pico.",
    peers: [
      { id: "me",  label: "Você",            fillRate: 78, cpm: 38, revenue: 1240, uptime: 97.4, impressions: 14400, isMe: true },
      { id: "p1",  label: "Média Barbearia", fillRate: 82, cpm: 44, revenue: 1580, uptime: 98.1, impressions: 18200 },
      { id: "p2",  label: "Top 25%",         fillRate: 91, cpm: 52, revenue: 2840, uptime: 99.2, impressions: 31000 },
      { id: "p3",  label: "Top 10%",         fillRate: 96, cpm: 62, revenue: 4120, uptime: 99.8, impressions: 52000 },
    ],
  },
  academia: {
    label: "Academia",
    insight: "Academias no top 25% cobram CPM 45% maior usando segmentos de audiência premium com dados de wellness.",
    peers: [
      { id: "me",  label: "Você",            fillRate: 85, cpm: 40, revenue: 1820, uptime: 98.2, impressions: 22000, isMe: true },
      { id: "p1",  label: "Média Academia",  fillRate: 88, cpm: 45, revenue: 2100, uptime: 98.6, impressions: 28000 },
      { id: "p2",  label: "Top 25%",         fillRate: 94, cpm: 58, revenue: 3400, uptime: 99.4, impressions: 44000 },
      { id: "p3",  label: "Top 10%",         fillRate: 98, cpm: 71, revenue: 5200, uptime: 99.9, impressions: 68000 },
    ],
  },
  restaurante: {
    label: "Restaurante",
    insight: "Restaurantes com playlist dinâmica (cardápio em tempo real) têm fill rate 22pp acima da média.",
    peers: [
      { id: "me",  label: "Você",            fillRate: 71, cpm: 36, revenue: 980,  uptime: 96.8, impressions: 12800, isMe: true },
      { id: "p1",  label: "Média Restaur.",  fillRate: 79, cpm: 41, revenue: 1420, uptime: 97.9, impressions: 18400 },
      { id: "p2",  label: "Top 25%",         fillRate: 89, cpm: 50, revenue: 2600, uptime: 99.0, impressions: 32000 },
      { id: "p3",  label: "Top 10%",         fillRate: 95, cpm: 58, revenue: 3800, uptime: 99.6, impressions: 48000 },
    ],
  },
  farmacia: {
    label: "Farmácia",
    insight: "Farmácias com NFS-e automática e ProofChain ativo atraem 3x mais campanhas de saúde/beleza.",
    peers: [
      { id: "me",  label: "Você",            fillRate: 80, cpm: 39, revenue: 1380, uptime: 98.0, impressions: 17200, isMe: true },
      { id: "p1",  label: "Média Farmácia",  fillRate: 85, cpm: 44, revenue: 1780, uptime: 98.7, impressions: 22400 },
      { id: "p2",  label: "Top 25%",         fillRate: 92, cpm: 54, revenue: 3100, uptime: 99.3, impressions: 38000 },
      { id: "p3",  label: "Top 10%",         fillRate: 97, cpm: 64, revenue: 4500, uptime: 99.8, impressions: 56000 },
    ],
  },
  varejo: {
    label: "Varejo",
    insight: "Lojas de varejo que usam contagem de passagem integrada vendem CPM 80% acima da média do segmento.",
    peers: [
      { id: "me",  label: "Você",            fillRate: 74, cpm: 37, revenue: 1100, uptime: 97.2, impressions: 13600, isMe: true },
      { id: "p1",  label: "Média Varejo",    fillRate: 80, cpm: 42, revenue: 1640, uptime: 98.2, impressions: 20000 },
      { id: "p2",  label: "Top 25%",         fillRate: 90, cpm: 55, revenue: 2980, uptime: 99.1, impressions: 36400 },
      { id: "p3",  label: "Top 10%",         fillRate: 96, cpm: 66, revenue: 4800, uptime: 99.7, impressions: 62000 },
    ],
  },
};

const METRICS = ["fillRate","cpm","revenue","uptime","impressions"] as const;
type Metric = typeof METRICS[number];

const METRIC_CFG: Record<Metric, { label: string; format: (v: number) => string; color: string }> = {
  fillRate:   { label: "Fill Rate",    format: v => `${v}%`,                       color: T.success },
  cpm:        { label: "CPM",          format: v => `R$${v}`,                      color: T.primary },
  revenue:    { label: "Receita/mês",  format: v => `R$${v.toLocaleString("pt-BR")}`, color: T.gold },
  uptime:     { label: "Uptime",       format: v => `${v}%`,                       color: T.accent  },
  impressions:{ label: "Impressões",   format: v => `${(v/1000).toFixed(0)}K`,     color: T.warning  },
};

function Diff({ mine, avg }: { mine: number; avg: number }) {
  const pct = Math.round((mine - avg) / avg * 100);
  const up = pct > 0;
  const Icon = pct === 0 ? Minus : up ? TrendingUp : TrendingDown;
  const color = pct >= 0 ? T.success : T.danger;
  return (
    <span className="flex items-center gap-0.5 text-xs font-bold" style={{ color }}>
      <Icon size={11} />{up ? "+" : ""}{pct}%
    </span>
  );
}

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

export default function CompetitorBenchmark({ onBack, onNavigate }: Props) {
  const [segment, setSegment] = useState<Segment>("barbearia");
  const [metric, setMetric] = useState<Metric>("revenue");
  const data = SEGMENT_DATA[segment];
  const me = data.peers.find(p => p.isMe)!;
  const avg = data.peers.find(p => p.id === "p1")!;
  const top25 = data.peers.find(p => p.id === "p2")!;

  const radarData = [
    { subject: "Fill Rate",   me: me.fillRate,    avg: avg.fillRate   },
    { subject: "CPM",         me: me.cpm / 0.8,   avg: avg.cpm / 0.8  },
    { subject: "Receita",     me: me.revenue / 50, avg: avg.revenue / 50 },
    { subject: "Uptime",      me: me.uptime,       avg: avg.uptime      },
    { subject: "Impressões",  me: me.impressions / 600, avg: avg.impressions / 600 },
  ];

  const barData = data.peers.map(p => ({
    name: p.label,
    value: p[metric] as number,
    isMe: !!p.isMe,
  }));

  const cfg = METRIC_CFG[metric];

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.primary + "20" }}>
              <BarChart2 size={18} style={{ color: T.primary }} />
            </div>
            <div>
              <h1 className="font-black text-lg">Benchmark de Mercado</h1>
              <p className="text-xs" style={{ color: T.textSub }}>Dados anonimizados da rede DOOHPLAY</p>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 pb-0 flex gap-1 overflow-x-auto">
          {(Object.entries(SEGMENT_DATA) as [Segment, typeof data][]).map(([k, v]) => (
            <button key={k} onClick={() => setSegment(k)}
              className="px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all"
              style={{ borderColor: segment === k ? T.primary : "transparent", color: segment === k ? T.primary : T.textSub }}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {(["fillRate","cpm","revenue","uptime"] as Metric[]).map(m => {
            const c = METRIC_CFG[m];
            return (
              <div key={m} className="p-3.5 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: T.textSub }}>{c.label}</span>
                  <Diff mine={me[m] as number} avg={avg[m] as number} />
                </div>
                <div className="font-black text-xl" style={{ color: c.color }}>{c.format(me[m] as number)}</div>
                <div className="text-xs mt-0.5" style={{ color: T.textSub }}>média: {c.format(avg[m] as number)}</div>
              </div>
            );
          })}
        </div>

        <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
          <h3 className="font-bold text-sm mb-4">Radar de performance vs. média do segmento</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke={T.border} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: T.textSub, fontSize: 11 }} />
              <Radar name="Você" dataKey="me" key="bench-radar-me" stroke={T.primary} fill={T.primary} fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Média" dataKey="avg" key="bench-radar-avg" stroke={T.textSub} fill={T.textSub} fillOpacity={0.05} strokeWidth={1} strokeDasharray="4 2" />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-6 text-xs mt-2">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 rounded" style={{ background: T.primary }} /><span style={{ color: T.textSub }}>Você</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 rounded border-t-2 border-dashed" style={{ borderColor: T.textSub }} /><span style={{ color: T.textSub }}>Média</span></div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Comparativo por métrica</h3>
            <div className="flex gap-1">
              {METRICS.map(m => (
                <button key={m} onClick={() => setMetric(m)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{ background: metric === m ? T.primary + "20" : "transparent", color: metric === m ? T.primary : T.textSub }}>
                  {METRIC_CFG[m].label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={barData} barSize={36}>
              <XAxis dataKey="name" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text }}
                formatter={(v: number) => [cfg.format(v), cfg.label]} />
              <Bar dataKey="value" radius={[6,6,0,0]}>
                {barData.map((entry, i) => (
                  <Cell key={`bench-cell-${i}`} fill={entry.isMe ? T.primary : T.border} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-4 rounded-2xl border" style={{ background: T.warning + "08", borderColor: T.warning + "25" }}>
          <div className="flex items-start gap-3">
            <AlertCircle size={16} style={{ color: T.warning, marginTop: 1 }} />
            <div>
              <div className="font-bold text-sm mb-1" style={{ color: T.warning }}>Gap para o Top 25%</div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(["fillRate","cpm","revenue"] as Metric[]).map(m => {
                  const gap = top25[m] as number - (me[m] as number);
                  const c = METRIC_CFG[m];
                  return (
                    <div key={m} className="p-2.5 rounded-xl" style={{ background: T.panel }}>
                      <div className="text-xs" style={{ color: T.textSub }}>{c.label}</div>
                      <div className="font-bold text-sm" style={{ color: T.warning }}>+{c.format(gap)} necessário</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border" style={{ background: T.primary + "08", borderColor: T.primary + "25" }}>
          <div className="font-bold text-sm mb-2">💡 Insight para {data.label}</div>
          <p className="text-sm" style={{ color: T.textSub }}>{data.insight}</p>
          <button onClick={() => onNavigate?.("revenue-optimizer")}
            className="mt-3 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
            style={{ background: T.primary + "20", color: T.primary }}>
            <Zap size={13} /> Otimizar agora
          </button>
        </div>
      </div>
    </div>
  );
}
