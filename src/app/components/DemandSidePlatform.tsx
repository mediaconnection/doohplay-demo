import { useState, useEffect } from "react";
import { ArrowLeft, Zap, Globe, TrendingUp, BarChart2, Target, DollarSign, Activity, Filter, RefreshCw, CheckCircle, AlertCircle, ChevronRight, Wifi } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280",
};

function randFloat(min: number, max: number) {
  return +(Math.random() * (max - min) + min).toFixed(2);
}

const DSPS = [
  { name: "Google DV360", status: "connected", cpm: 38.50, budget: 12400, impressions: 324000, winRate: 42, color: T.success },
  { name: "The Trade Desk", status: "connected", cpm: 44.20, budget: 8700, impressions: 197000, winRate: 38, color: T.success },
  { name: "Amazon DSP", status: "pending", cpm: 41.00, budget: 0, impressions: 0, winRate: 0, color: T.warning },
  { name: "Xandr (AT&T)", status: "pending", cpm: 39.80, budget: 0, impressions: 0, winRate: 0, color: T.warning },
  { name: "MediaMath", status: "configured", cpm: 36.50, budget: 3200, impressions: 87800, winRate: 31, color: T.primary },
  { name: "Yahoo DSP", status: "configured", cpm: 33.20, budget: 2100, impressions: 63200, winRate: 28, color: T.primary },
];

const bidStream = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  dsp: DSPS[Math.floor(Math.random() * DSPS.length)].name,
  cpm: randFloat(28, 52),
  won: Math.random() > 0.55,
  screen: "SCR-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
  timestamp: new Date(Date.now() - i * 1800).toLocaleTimeString("pt-BR"),
}));

const bidVolumeData = Array.from({ length: 12 }, (_, i) => ({
  hour: `${i * 2}h`,
  bids: Math.floor(Math.random() * 8000 + 2000),
  wins: Math.floor(Math.random() * 3000 + 800),
  revenue: Math.floor(Math.random() * 2000 + 400),
}));

const openRtbSpec = [
  { field: "openrtb_version", value: "2.5", status: "ok" },
  { field: "imp.banner.w", value: "1920", status: "ok" },
  { field: "imp.banner.h", value: "1080", status: "ok" },
  { field: "imp.video", value: "mp4, h264", status: "ok" },
  { field: "site.dooh.venueType", value: "retail, restaurant, gym...", status: "ok" },
  { field: "device.geo.lat/lon", value: "[-23.55, -46.63]", status: "ok" },
  { field: "device.ua", value: "DOOHPLAY/1.0 Android", status: "ok" },
  { field: "imp.pmp.deals", value: "PMP & open auction", status: "ok" },
  { field: "audio", value: "OpenRTB Audio", status: "planned" },
  { field: "native", value: "OpenRTB Native 1.2", status: "planned" },
];

interface Props { onBack: () => void; }

export default function DemandSidePlatform({ onBack }: Props) {
  const [tab, setTab] = useState<"overview" | "openrtb" | "dsps" | "bids" | "floor">("overview");
  const [liveBids, setLiveBids] = useState(bidStream);
  const [totalBids, setTotalBids] = useState(671200);
  const [totalRevenue, setTotalRevenue] = useState(26382);
  const [floorCpm, setFloorCpm] = useState(28);
  const [selectedDeal, setSelectedDeal] = useState<string | null>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      const newBid = {
        id: Date.now(),
        dsp: DSPS[Math.floor(Math.random() * DSPS.length)].name,
        cpm: randFloat(28, 52),
        won: Math.random() > 0.55,
        screen: "SCR-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
        timestamp: new Date().toLocaleTimeString("pt-BR"),
      };
      setLiveBids(prev => [newBid, ...prev.slice(0, 19)]);
      setTotalBids(b => b + Math.floor(Math.random() * 8) + 2);
      setTotalRevenue(r => r + Math.floor(Math.random() * 4));
    }, 1200);
    return () => clearInterval(iv);
  }, []);

  const TABS = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "openrtb", label: "OpenRTB 2.5", icon: Globe },
    { id: "dsps", label: "DSPs conectados", icon: Wifi },
    { id: "bids", label: "Bid stream", icon: Activity },
    { id: "floor", label: "Floor price", icon: DollarSign },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F0", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm hover:text-white transition-colors" style={{ color: T.textSub }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-2 font-bold">
            <Zap size={16} style={{ color: T.primary }} /> Demand Side Platform
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: T.success + "40", color: T.success }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />
            OpenRTB 2.5 live
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Bids recebidos", value: totalBids.toLocaleString("pt-BR"), color: T.primary, icon: Activity },
            { label: "Win rate médio", value: "37%", color: T.success, icon: Target },
            { label: "CPM médio pago", value: "R$41,20", color: T.accent, icon: DollarSign },
            { label: "Receita de mídia", value: `R$${totalRevenue.toLocaleString("pt-BR")}`, color: T.warning, icon: TrendingUp },
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: T.textSub }}>{m.label}</span>
                  <Icon size={14} style={{ color: m.color }} />
                </div>
                <div className="text-2xl font-black" style={{ color: m.color }}>{m.value}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={{ background: tab === t.id ? T.primary : T.card, color: tab === t.id ? "#fff" : T.textSub, border: `1px solid ${tab === t.id ? T.primary : T.border}` }}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-1">Volume de bids por hora</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Bids recebidos vs. leilões ganhos</p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={bidVolumeData}>
                    <defs>
                      <linearGradient key="dsp-bids" id="dsp-bids" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient key="dsp-wins" id="dsp-wins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.success} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} />
                    <Area key="area-bids" type="monotone" dataKey="bids" stroke={T.primary} fill="url(#dsp-bids)" strokeWidth={2} name="Bids" />
                    <Area key="area-wins" type="monotone" dataKey="wins" stroke={T.success} fill="url(#dsp-wins)" strokeWidth={2} name="Wins" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-1">CPM por DSP</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>CPM médio pago por plataforma</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={DSPS.filter(d => d.status !== "pending")} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`R$${v}`, "CPM"]} />
                    <Bar key="bar-cpm" dataKey="cpm" radius={[0, 4, 4, 0]}>
                      {DSPS.filter(d => d.status !== "pending").map((d) => (
                        <Cell key={`dsp-cell-${d.name}`} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Funil de leilão programático</h3>
              <div className="flex items-stretch gap-4">
                {[
                  { label: "Bid requests enviados", value: "2.4M/dia", pct: 100, color: T.primary },
                  { label: "Bids recebidos", value: "671k/dia", pct: 28, color: T.accent },
                  { label: "Leilões ganhos", value: "248k/dia", pct: 37, color: T.success },
                  { label: "Impressões verificadas", value: "248k/dia", pct: 100, color: T.warning },
                ].map((step, i) => (
                  <div key={i} className="flex-1 text-center">
                    <div className="text-xs mb-2 font-medium" style={{ color: T.textSub }}>{step.label}</div>
                    <div className="text-xl font-black mb-1" style={{ color: step.color }}>{step.value}</div>
                    {i > 0 && <div className="text-xs" style={{ color: T.textSub }}>{step.pct}% conversão</div>}
                    <div className="mt-2 h-1.5 rounded-full" style={{ background: step.color + "30" }}>
                      <div className="h-full rounded-full" style={{ width: `${step.pct}%`, background: step.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* OpenRTB spec */}
        {tab === "openrtb" && (
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="flex-1 rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                <h2 className="font-bold text-lg mb-2">Implementação OpenRTB 2.5</h2>
                <p className="text-sm mb-6" style={{ color: T.textSub }}>
                  Suporte completo ao padrão IAB OpenRTB 2.5 com extensões DOOH (venue type, location, audience). Compatível com todos os principais DSPs do mercado.
                </p>
                <div className="space-y-2">
                  {openRtbSpec.map((row, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl border text-sm" style={{ background: T.panel, borderColor: T.border }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: row.status === "ok" ? T.success + "20" : T.warning + "20" }}>
                        {row.status === "ok"
                          ? <CheckCircle size={12} style={{ color: T.success }} />
                          : <AlertCircle size={12} style={{ color: T.warning }} />}
                      </div>
                      <code className="font-mono text-xs flex-shrink-0 w-40" style={{ color: T.primary }}>{row.field}</code>
                      <span className="text-xs flex-1 truncate" style={{ color: T.textSub }}>{row.value}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: row.status === "ok" ? T.success + "15" : T.warning + "15", color: row.status === "ok" ? T.success : T.warning }}>
                        {row.status === "ok" ? "Implementado" : "Planejado"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-72 space-y-4">
                <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                  <h3 className="font-bold mb-3">Formatos suportados</h3>
                  {["Banner 1920×1080", "Video MP4 H.264", "Lateral 540×1080", "Faixa 1920×270", "VAST 4.x"].map((f, i) => (
                    <div key={i} className="flex items-center gap-2 py-2 border-b text-sm" style={{ borderColor: T.border }}>
                      <CheckCircle size={12} style={{ color: T.success }} />
                      <span style={{ color: T.textSub }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                  <h3 className="font-bold mb-3">Deal types</h3>
                  {["Open Auction", "Private Marketplace (PMP)", "Preferred Deal", "Programmatic Guaranteed"].map((d, i) => (
                    <div key={i} className="flex items-center gap-2 py-2 border-b text-sm" style={{ borderColor: T.border }}>
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: i < 2 ? T.success : T.warning }} />
                      <span style={{ color: T.textSub }}>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DSPs */}
        {tab === "dsps" && (
          <div className="space-y-4">
            {DSPS.map((dsp, i) => (
              <div key={i} className="rounded-2xl border p-6" style={{ background: T.card, borderColor: dsp.status === "connected" ? dsp.color + "30" : T.border }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs"
                      style={{ background: dsp.color + "20", color: dsp.color }}>
                      {dsp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold">{dsp.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: dsp.color }} />
                        <span className="text-xs" style={{ color: dsp.color }}>
                          {dsp.status === "connected" ? "Conectado" : dsp.status === "pending" ? "Aguardando aprovação" : "Configurado"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {dsp.status !== "pending" && (
                    <div className="grid grid-cols-3 gap-6 text-center">
                      {[
                        { label: "CPM médio", value: `R$${dsp.cpm}` },
                        { label: "Budget ativo", value: `R$${dsp.budget.toLocaleString("pt-BR")}` },
                        { label: "Win rate", value: `${dsp.winRate}%` },
                      ].map((s, j) => (
                        <div key={j}>
                          <div className="text-xs" style={{ color: T.textSub }}>{s.label}</div>
                          <div className="font-bold text-sm mt-0.5">{s.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {dsp.status === "pending" && (
                    <button className="px-4 py-2 rounded-xl text-sm border" style={{ borderColor: T.warning + "40", color: T.warning }}>
                      Solicitar acesso
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bid stream */}
        {tab === "bids" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl">Bid stream ao vivo</h2>
              <div className="flex items-center gap-2 text-xs" style={{ color: T.success }}>
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />
                Atualizando em tempo real
              </div>
            </div>
            <div className="space-y-2">
              {liveBids.map((bid, i) => (
                <div key={bid.id} className="flex items-center gap-4 p-3 rounded-xl border text-xs font-mono transition-all"
                  style={{
                    background: i === 0 ? (bid.won ? T.success + "08" : T.danger + "05") : T.card,
                    borderColor: i === 0 ? (bid.won ? T.success + "30" : T.border) : T.border,
                  }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: bid.won ? T.success : T.textSub + "60" }} />
                  <div className="w-16 flex-shrink-0" style={{ color: T.textSub }}>{bid.timestamp}</div>
                  <div className="w-36 flex-shrink-0 truncate" style={{ color: T.primary }}>{bid.dsp}</div>
                  <div className="w-20 flex-shrink-0" style={{ color: T.textSub }}>{bid.screen}</div>
                  <div className="flex-1 font-bold" style={{ color: bid.won ? T.success : T.textSub }}>
                    R${bid.cpm.toFixed(2)} CPM
                  </div>
                  <div className="px-2 py-0.5 rounded-full" style={{
                    background: bid.won ? T.success + "20" : T.textSub + "15",
                    color: bid.won ? T.success : T.textSub,
                  }}>
                    {bid.won ? "WON" : "LOST"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floor price */}
        {tab === "floor" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
              <h2 className="font-bold text-xl mb-2">Gestão de floor price</h2>
              <p className="text-sm mb-6" style={{ color: T.textSub }}>Preço mínimo por CPM para aceitar um bid. Bids abaixo do floor são rejeitados automaticamente.</p>

              <div className="mb-6">
                <label className="text-sm font-medium mb-2 block">Floor global (CPM mínimo)</label>
                <div className="flex items-center gap-4">
                  <input type="range" min={10} max={60} value={floorCpm} onChange={e => setFloorCpm(Number(e.target.value))}
                    className="flex-1" style={{ accentColor: T.primary }} />
                  <div className="text-2xl font-black" style={{ color: T.primary }}>R${floorCpm}</div>
                </div>
                <div className="flex justify-between text-xs mt-1" style={{ color: T.textSub }}>
                  <span>R$10 (baixo)</span><span>R$35 (recomendado)</span><span>R$60 (premium)</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <h3 className="font-medium text-sm">Floor por contexto</h3>
                {[
                  { context: "Shopping / Mall", floor: 45, icon: "🏪" },
                  { context: "Restaurante", floor: 38, icon: "🍽️" },
                  { context: "Academia", floor: 32, icon: "💪" },
                  { context: "Hospital / Saúde", floor: 52, icon: "🏥" },
                  { context: "Hotel", floor: 48, icon: "🏨" },
                  { context: "Corporativo", floor: 55, icon: "🏢" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border text-sm" style={{ background: T.panel, borderColor: T.border }}>
                    <span className="text-lg">{row.icon}</span>
                    <span className="flex-1">{row.context}</span>
                    <span className="font-mono font-bold" style={{ color: row.floor > 45 ? T.success : T.primary }}>R${row.floor} CPM</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-4">Impacto do floor atual</h3>
                <div className="space-y-4">
                  {[
                    { label: "Bids aceitos", value: `${Math.round(100 - floorCpm * 0.9)}%`, color: T.success },
                    { label: "Bids rejeitados", value: `${Math.round(floorCpm * 0.9)}%`, color: T.danger },
                    { label: "CPM médio resultante", value: `R$${(floorCpm * 1.38).toFixed(0)}`, color: T.primary },
                    { label: "Fill rate estimado", value: `${Math.round(95 - floorCpm * 0.5)}%`, color: T.warning },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b pb-3" style={{ borderColor: T.border }}>
                      <span style={{ color: T.textSub }}>{row.label}</span>
                      <span className="font-bold" style={{ color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-3">Recomendação de floor</h3>
                <div className="text-sm leading-relaxed" style={{ color: T.textSub }}>
                  Com base no CPM médio atual de <span style={{ color: T.text }}>R$41,20</span> e win rate de <span style={{ color: T.text }}>37%</span>, o floor ótimo para maximizar receita sem reduzir fill rate é entre <span style={{ color: T.success }}>R$28 e R$35</span>.
                </div>
                <button className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium" style={{ background: T.primary, color: "#fff" }}>
                  Aplicar floor ótimo (R$32)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
