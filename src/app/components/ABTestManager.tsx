import { useState } from "react";
import { ArrowLeft, Plus, Play, Pause, Trophy, TrendingUp, Eye, DollarSign, Target, CheckCircle, FlaskConical, BarChart2, Clock, Zap, ChevronRight, X } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

interface Variant {
  id: "A" | "B";
  name: string;
  creative: string;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  color: string;
}

interface ABTest {
  id: number;
  name: string;
  screen: string;
  status: "running" | "paused" | "completed" | "draft";
  startDate: string;
  endDate: string;
  split: number; // % for A
  variants: [Variant, Variant];
  winner?: "A" | "B" | null;
  metric: "ctr" | "revenue" | "impressions";
}

const SCREENS = ["Recepção", "Sala Espera A", "Corredor B2", "Vitrine Norte", "Caixa 1"];

const TESTS: ABTest[] = [
  {
    id: 1, name: "Banner Verão vs. Vídeo 15s", screen: "Recepção",
    status: "running", startDate: "01/07/2026", endDate: "31/07/2026",
    split: 50, metric: "ctr",
    variants: [
      { id: "A", name: "Banner Estático", creative: "banner-verao-16x9.jpg", impressions: 42800, clicks: 1284, conversions: 192, revenue: 1820, color: T.primary },
      { id: "B", name: "Vídeo 15 segundos", creative: "video-verao-15s.mp4", impressions: 41200, clicks: 1648, conversions: 261, revenue: 2210, color: T.accent },
    ],
    winner: null,
  },
  {
    id: 2, name: "CTA Vermelho vs. Verde", screen: "Vitrine Norte",
    status: "completed", startDate: "01/06/2026", endDate: "30/06/2026",
    split: 50, metric: "revenue",
    variants: [
      { id: "A", name: "CTA Vermelho", creative: "cta-red.jpg", impressions: 38400, clicks: 960, conversions: 144, revenue: 2880, color: T.danger },
      { id: "B", name: "CTA Verde", creative: "cta-green.jpg", impressions: 37900, clicks: 1137, conversions: 193, revenue: 3860, color: T.success },
    ],
    winner: "B",
  },
  {
    id: 3, name: "Oferta 20% vs. Frete Grátis", screen: "Caixa 1",
    status: "paused", startDate: "15/07/2026", endDate: "22/07/2026",
    split: 50, metric: "conversions",
    variants: [
      { id: "A", name: "Desconto 20%", creative: "desconto-20.jpg", impressions: 12400, clicks: 496, conversions: 99, revenue: 990, color: T.warning },
      { id: "B", name: "Frete Grátis", creative: "frete-gratis.jpg", impressions: 11800, clicks: 354, conversions: 71, revenue: 710, color: T.gold },
    ],
    winner: null,
  },
];

const TREND_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `D${i + 1}`,
  a: Math.floor(3.0 + Math.random() * 0.8 + (i * 0.02)),
  b: Math.floor(3.8 + Math.random() * 0.9 + (i * 0.04)),
}));

const statusCfg = {
  running:   { label: "Rodando",   color: T.success },
  paused:    { label: "Pausado",   color: T.warning },
  completed: { label: "Concluído", color: T.primary },
  draft:     { label: "Rascunho",  color: T.textSub },
};

const metricLabel = { ctr: "CTR", revenue: "Receita", impressions: "Impressões", conversions: "Conversões" };
const tooltipStyle = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text };

export default function ABTestManager({ onBack, onNavigate }: Props) {
  const [tests, setTests]     = useState<ABTest[]>(TESTS);
  const [selected, setSelected] = useState<ABTest | null>(tests[0]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState({ name: "", screen: SCREENS[0], metric: "ctr" as ABTest["metric"] });

  const ctr = (v: Variant) => v.impressions > 0 ? ((v.clicks / v.impressions) * 100).toFixed(2) : "0.00";
  const cvr = (v: Variant) => v.clicks > 0 ? ((v.conversions / v.clicks) * 100).toFixed(1) : "0.0";
  const rpm = (v: Variant) => v.impressions > 0 ? ((v.revenue / v.impressions) * 1000).toFixed(2) : "0.00";

  const getWinnerMetric = (test: ABTest) => {
    const [a, b] = test.variants;
    if (test.metric === "ctr")      return parseFloat(ctr(b)) > parseFloat(ctr(a)) ? "B" : "A";
    if (test.metric === "revenue")  return b.revenue > a.revenue ? "B" : "A";
    return b.conversions > a.conversions ? "B" : "A";
  };

  const lift = (test: ABTest) => {
    const [a, b] = test.variants;
    let av = 0, bv = 0;
    if (test.metric === "ctr")     { av = parseFloat(ctr(a)); bv = parseFloat(ctr(b)); }
    else if (test.metric === "revenue") { av = a.revenue; bv = b.revenue; }
    else { av = a.conversions; bv = b.conversions; }
    if (av === 0) return 0;
    return (((bv - av) / av) * 100).toFixed(1);
  };

  const createTest = () => {
    const newTest: ABTest = {
      id: Date.now(), name: form.name, screen: form.screen,
      status: "draft", startDate: "23/07/2026", endDate: "06/08/2026",
      split: 50, metric: form.metric,
      variants: [
        { id: "A", name: "Variante A", creative: "criativo-a.jpg", impressions: 0, clicks: 0, conversions: 0, revenue: 0, color: T.primary },
        { id: "B", name: "Variante B", creative: "criativo-b.jpg", impressions: 0, clicks: 0, conversions: 0, revenue: 0, color: T.accent },
      ],
      winner: null,
    };
    setTests(prev => [newTest, ...prev]);
    setSelected(newTest);
    setShowForm(false);
    setForm({ name: "", screen: SCREENS[0], metric: "ctr" });
  };

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <FlaskConical size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">A/B Test Manager</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Compare criativos e maximize performance</p>
              </div>
            </div>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: T.primary, color: "#fff" }}>
            <Plus size={14} /> Novo Teste
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6">
        {/* Test list */}
        <div className="w-72 flex-shrink-0 space-y-3">
          {tests.map(test => {
            const cfg = statusCfg[test.status];
            const leading = test.status !== "draft" ? getWinnerMetric(test) : null;
            return (
              <div key={test.id} onClick={() => setSelected(test)}
                className="p-4 rounded-2xl border cursor-pointer transition-all hover:border-opacity-60"
                style={{ background: T.card, borderColor: selected?.id === test.id ? T.primary + "60" : T.border }}>
                <div className="flex items-start justify-between mb-2">
                  <span className="font-bold text-sm leading-tight flex-1 mr-2">{test.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                    style={{ background: cfg.color + "20", color: cfg.color }}>{cfg.label}</span>
                </div>
                <div className="text-xs mb-3" style={{ color: T.textSub }}>{test.screen} · {test.startDate}</div>
                {test.status !== "draft" && (
                  <div className="flex items-center gap-2">
                    {test.variants.map(v => (
                      <div key={v.id} className="flex-1 p-2 rounded-lg text-center"
                        style={{ background: v.id === (test.winner ?? leading) ? v.color + "20" : T.panel, border: `1px solid ${v.id === (test.winner ?? leading) ? v.color + "40" : T.border}` }}>
                        <div className="font-black text-xs" style={{ color: v.color }}>{v.id}</div>
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>
                          {test.metric === "ctr" ? `${ctr(v)}%` : test.metric === "revenue" ? `R$${v.revenue.toLocaleString("pt-BR")}` : v.conversions}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail */}
        {selected && (
          <div className="flex-1 space-y-5">
            {/* Test header */}
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-black text-xl">{selected.name}</h2>
                  <p className="text-sm mt-0.5" style={{ color: T.textSub }}>
                    {selected.screen} · {selected.startDate} – {selected.endDate} · Métrica: {metricLabel[selected.metric]}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selected.status === "running" && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: T.success + "20", color: T.success }}>
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: T.success }} />
                      Rodando
                    </div>
                  )}
                  {selected.winner && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: T.gold + "20", color: T.gold }}>
                      <Trophy size={12} /> Vencedor: {selected.winner} (+{lift(selected)}%)
                    </div>
                  )}
                </div>
              </div>

              {/* Variant comparison */}
              <div className="grid grid-cols-2 gap-4">
                {selected.variants.map(v => {
                  const isLeading = selected.status !== "draft" && v.id === (selected.winner ?? getWinnerMetric(selected));
                  const isWinner  = v.id === selected.winner;
                  return (
                    <div key={v.id} className="p-4 rounded-2xl border"
                      style={{ background: T.panel, borderColor: isLeading ? v.color + "50" : T.border }}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm"
                            style={{ background: v.color + "25", color: v.color }}>{v.id}</div>
                          <div>
                            <div className="font-bold text-sm">{v.name}</div>
                            <div className="text-xs" style={{ color: T.textSub }}>{v.creative}</div>
                          </div>
                        </div>
                        {isWinner && <Trophy size={16} style={{ color: T.gold }} />}
                        {isLeading && !isWinner && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: v.color + "20", color: v.color }}>Liderando</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Impressões", value: v.impressions.toLocaleString("pt-BR") },
                          { label: "CTR", value: `${ctr(v)}%` },
                          { label: "Conversões", value: v.conversions.toLocaleString("pt-BR") },
                          { label: "CVR", value: `${cvr(v)}%` },
                          { label: "Receita", value: `R$${v.revenue.toLocaleString("pt-BR")}` },
                          { label: "RPM", value: `R$${rpm(v)}` },
                        ].map((m, i) => (
                          <div key={i} className="p-2 rounded-lg" style={{ background: T.card }}>
                            <div className="text-xs mb-0.5" style={{ color: T.textSub }}>{m.label}</div>
                            <div className="font-black text-sm" style={{ color: v.color }}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trend chart */}
            {selected.status !== "draft" && (
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-4">Evolução do CTR por dia</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={TREND_DATA}>
                    <defs>
                      <linearGradient key="ab-a" id="ab-a" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient key="ab-b" id="ab-b" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.accent} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={T.accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`${v}%`, `Variante ${name.toUpperCase()}`]} />
                    <Area key="area-a" type="monotone" dataKey="a" stroke={T.primary} fill="url(#ab-a)" strokeWidth={2} dot={false} name="a" />
                    <Area key="area-b" type="monotone" dataKey="b" stroke={T.accent} fill="url(#ab-b)" strokeWidth={2} dot={false} name="b" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-2">
                  {selected.variants.map(v => (
                    <div key={v.id} className="flex items-center gap-1.5 text-xs">
                      <div className="w-3 h-3 rounded-sm" style={{ background: v.color }} />
                      <span style={{ color: T.textSub }}>Variante {v.id} — {v.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confidence & stats */}
            {selected.status !== "draft" && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Confiança estatística", value: selected.status === "completed" ? "97.4%" : "82.1%", color: selected.status === "completed" ? T.success : T.warning },
                  { label: "Lift da variante B", value: `+${lift(selected)}%`, color: parseFloat(lift(selected) as string) > 0 ? T.success : T.danger },
                  { label: "Dias restantes", value: selected.status === "completed" ? "Encerrado" : "9 dias", color: T.primary },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}>
                    <div className="font-black text-2xl mb-1" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {selected.status === "running" && (
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: T.warning + "20", color: T.warning, border: `1px solid ${T.warning}30` }}>
                  <Pause size={14} /> Pausar teste
                </button>
              )}
              {selected.status === "paused" && (
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: T.success + "20", color: T.success, border: `1px solid ${T.success}30` }}>
                  <Play size={14} /> Retomar teste
                </button>
              )}
              {selected.status === "draft" && (
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: T.primary, color: "#fff" }}>
                  <Play size={14} /> Iniciar teste
                </button>
              )}
              {selected.status === "completed" && selected.winner && (
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{ background: T.gold + "20", color: T.gold, border: `1px solid ${T.gold}30` }}>
                  <Trophy size={14} /> Aplicar vencedor à tela
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-md p-6 rounded-3xl border" style={{ background: T.panel, borderColor: T.border }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg">Novo Teste A/B</h3>
              <button onClick={() => setShowForm(false)}><X size={18} style={{ color: T.textSub }} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Nome do teste</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Banner vs. Vídeo"
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: T.textSub }}>Tela</label>
                <select value={form.screen} onChange={e => setForm(f => ({ ...f, screen: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
                  {SCREENS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-2" style={{ color: T.textSub }}>Métrica de sucesso</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["ctr","revenue","impressions"] as const).map(m => (
                    <button key={m} onClick={() => setForm(f => ({ ...f, metric: m }))}
                      className="py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: form.metric === m ? T.primary + "20" : T.card, color: form.metric === m ? T.primary : T.textSub, border: `1px solid ${form.metric === m ? T.primary + "40" : T.border}` }}>
                      {metricLabel[m]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
                Cancelar
              </button>
              <button onClick={createTest} disabled={!form.name}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: form.name ? T.primary : T.textSub, color: "#fff" }}>
                Criar Teste
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
