import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Zap, DollarSign, Trophy, TrendingUp, Play, Pause, RotateCcw, Eye, Clock, BarChart2, Cpu, ChevronRight } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

// Weighted lottery: Premium 60%, Standard 20%, Basic 15%, Fallback 5%
const TIERS = [
  { id: "premium",  label: "Premium",  weight: 60, color: T.gold,    cpm: 68, icon: Trophy },
  { id: "standard", label: "Standard", weight: 20, color: T.primary, cpm: 42, icon: TrendingUp },
  { id: "basic",    label: "Basic",    weight: 15, color: T.accent,  cpm: 28, icon: BarChart2 },
  { id: "fallback", label: "Fallback", weight: 5,  color: T.textSub, cpm: 12, icon: Clock },
];

interface Bid {
  id: number; advertiser: string; tier: string; cpm: number;
  creative: string; won: boolean; timestamp: number; score: number;
}

interface AuctionEvent {
  slot: number; winner: Bid; allBids: Bid[];
  revenue: number; timestamp: Date;
}

const ADVERTISERS = [
  { name: "Bar & Grill SP",      tier: "premium",  cpm: 72 },
  { name: "Farmácia Saúde+",     tier: "premium",  cpm: 65 },
  { name: "Academia FitLife",    tier: "standard", cpm: 44 },
  { name: "Clínica Bem-Estar",   tier: "standard", cpm: 40 },
  { name: "Barbearia Kings",     tier: "basic",    cpm: 29 },
  { name: "Pet Shop Amigos",     tier: "basic",    cpm: 26 },
  { name: "Restaurante Sabor",   tier: "premium",  cpm: 69 },
  { name: "Padaria Mineira",     tier: "standard", cpm: 38 },
  { name: "Loja de Roupas MG",   tier: "basic",    cpm: 24 },
  { name: "DOOHPLAY Default",    tier: "fallback",  cpm: 10 },
];

const CREATIVES = ["Banner Verão", "Oferta Especial", "Institucional", "Flash Sale", "Cardápio Digital", "Promo Mês"];

function weightedDraw(tier: string): boolean {
  const t = TIERS.find(t => t.id === tier)!;
  return Math.random() * 100 < t.weight;
}

function runAuction(slotNum: number): AuctionEvent {
  // Pick 3–5 random bidders
  const count = Math.floor(Math.random() * 3) + 3;
  const shuffled = [...ADVERTISERS].sort(() => Math.random() - 0.5).slice(0, count);

  const bids: Bid[] = shuffled.map((adv, i) => {
    const tier = TIERS.find(t => t.id === adv.tier)!;
    const jitter = (Math.random() * 0.2 - 0.1) * adv.cpm;
    const cpm = Math.max(1, adv.cpm + jitter);
    // Score = CPM × tier weight × random factor
    const score = cpm * (tier.weight / 100) * (0.8 + Math.random() * 0.4);
    return {
      id: i, advertiser: adv.name, tier: adv.tier,
      cpm: Math.round(cpm * 100) / 100,
      creative: CREATIVES[Math.floor(Math.random() * CREATIVES.length)],
      won: false, timestamp: Date.now(), score,
    };
  });

  // Winner = highest score
  const winner = bids.reduce((a, b) => b.score > a.score ? b : a);
  winner.won = true;

  return {
    slot: slotNum, winner,
    allBids: bids.sort((a, b) => b.score - a.score),
    revenue: winner.cpm / 1000 * 250, // 250 avg impressions per slot
    timestamp: new Date(),
  };
}

const tooltipStyle = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text };

export default function AdAuctionEngine({ onBack, onNavigate }: Props) {
  const [running, setRunning]     = useState(false);
  const [events, setEvents]       = useState<AuctionEvent[]>([]);
  const [slotCount, setSlotCount] = useState(0);
  const [speed, setSpeed]         = useState(1500); // ms per auction
  const [tab, setTab]             = useState<"live" | "stats" | "tiers">("live");
  const intervalRef               = useRef<ReturnType<typeof setInterval> | null>(null);
  const slotRef                   = useRef(0);

  const startStop = () => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
    } else {
      setRunning(true);
      intervalRef.current = setInterval(() => {
        slotRef.current += 1;
        const ev = runAuction(slotRef.current);
        setSlotCount(slotRef.current);
        setEvents(prev => [ev, ...prev].slice(0, 50));
      }, speed);
    }
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setEvents([]);
    setSlotCount(0);
    slotRef.current = 0;
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Reconfigure interval when speed changes
  useEffect(() => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        slotRef.current += 1;
        const ev = runAuction(slotRef.current);
        setSlotCount(slotRef.current);
        setEvents(prev => [ev, ...prev].slice(0, 50));
      }, speed);
    }
  }, [speed]);

  const totalRevenue    = events.reduce((a, e) => a + e.revenue, 0);
  const avgCPM          = events.length ? events.reduce((a, e) => a + e.winner.cpm, 0) / events.length : 0;
  const tierCounts      = TIERS.map(t => ({ ...t, count: events.filter(e => e.winner.tier === t.id).length }));
  const revenueHistory  = events.slice(0, 20).reverse().map((e, i) => ({ slot: e.slot, rev: e.revenue, cpm: e.winner.cpm }));
  const lastEvent       = events[0];

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
                <Zap size={18} style={{ color: T.gold }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Ad Auction Engine</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Leilão ponderado em tempo real — DOOHPLAY</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Speed */}
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: T.textSub }}>Velocidade:</span>
              <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                {[{ label: "1×", ms: 2000 }, { label: "2×", ms: 1000 }, { label: "5×", ms: 400 }].map(s => (
                  <button key={s.label} onClick={() => setSpeed(s.ms)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                    style={{ background: speed === s.ms ? T.primary : "transparent", color: speed === s.ms ? "#fff" : T.textSub }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={reset} className="p-2 rounded-xl hover:bg-white/5">
              <RotateCcw size={16} style={{ color: T.textSub }} />
            </button>
            <button onClick={startStop}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black transition-all"
              style={{ background: running ? T.danger : T.success, color: "#fff" }}>
              {running ? <><Pause size={15} /> Pausar</> : <><Play size={15} /> {events.length === 0 ? "Iniciar Simulação" : "Continuar"}</>}
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pb-0 flex gap-1">
          {(["live","stats","tiers"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2.5 text-sm font-bold border-b-2 transition-all"
              style={{ color: tab === t ? T.primary : T.textSub, borderColor: tab === t ? T.primary : "transparent" }}>
              {t === "live" ? "Ao Vivo" : t === "stats" ? "Estatísticas" : "Configuração de Tiers"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Slots leiloados", value: slotCount, color: T.primary, icon: Zap },
            { label: "Receita gerada", value: `R$${totalRevenue.toFixed(2)}`, color: T.gold, icon: DollarSign },
            { label: "CPM médio", value: avgCPM > 0 ? `R$${avgCPM.toFixed(2)}` : "—", color: T.success, icon: TrendingUp },
            { label: "Impressões est.", value: (slotCount * 250).toLocaleString("pt-BR"), color: T.accent, icon: Eye },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: k.color + "20" }}>
                <k.icon size={16} style={{ color: k.color }} />
              </div>
              <div>
                <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Idle state */}
        {events.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center gap-4 rounded-2xl border" style={{ borderColor: T.border }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
              <Zap size={28} style={{ color: T.gold }} />
            </div>
            <h3 className="font-black text-xl">Motor de leilão pronto</h3>
            <p className="text-sm text-center max-w-sm" style={{ color: T.textSub }}>
              Clique em <strong style={{ color: T.success }}>Iniciar Simulação</strong> para ver o leilão ponderado DOOHPLAY acontecer em tempo real. Cada slot de 15s é disputado por múltiplos anunciantes.
            </p>
            <div className="flex items-center gap-4 mt-2">
              {TIERS.map(t => (
                <div key={t.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                  style={{ background: t.color + "20", color: t.color, border: `1px solid ${t.color}30` }}>
                  {t.weight}% {t.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live tab */}
        {tab === "live" && events.length > 0 && (
          <div className="grid grid-cols-3 gap-6">
            {/* Last auction */}
            <div className="col-span-2 space-y-4">
              {lastEvent && (
                <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.gold + "30" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: T.success }} />
                      <span className="font-bold text-sm">Slot #{lastEvent.slot} — {lastEvent.timestamp.toLocaleTimeString("pt-BR")}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: T.success + "20", color: T.success }}>
                      VENCEDOR
                    </span>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl mb-4" style={{ background: T.panel }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
                      <Trophy size={18} style={{ color: T.gold }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-black text-lg">{lastEvent.winner.advertiser}</div>
                      <div className="text-sm" style={{ color: T.textSub }}>{lastEvent.winner.creative} · Tier {lastEvent.winner.tier}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-2xl" style={{ color: T.gold }}>R${lastEvent.winner.cpm.toFixed(2)}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>CPM vencedor</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold mb-2" style={{ color: T.textSub }}>TODOS OS LANCES</div>
                    {lastEvent.allBids.map((bid, i) => {
                      const tier = TIERS.find(t => t.id === bid.tier)!;
                      const maxScore = lastEvent.allBids[0].score;
                      return (
                        <div key={bid.id} className="flex items-center gap-3 p-2.5 rounded-xl"
                          style={{ background: bid.won ? T.gold + "10" : T.panel, border: `1px solid ${bid.won ? T.gold + "30" : T.border}` }}>
                          <span className="text-xs font-bold w-5 text-center" style={{ color: T.textSub }}>#{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate">{bid.advertiser}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold flex-shrink-0"
                                style={{ background: tier.color + "20", color: tier.color }}>
                                {tier.label}
                              </span>
                            </div>
                            <div className="h-1 mt-1 rounded-full overflow-hidden" style={{ background: T.border }}>
                              <div className="h-full rounded-full" style={{ width: `${(bid.score / maxScore) * 100}%`, background: tier.color }} />
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-bold text-sm" style={{ color: bid.won ? T.gold : T.text }}>R${bid.cpm.toFixed(2)}</div>
                            <div className="text-xs" style={{ color: T.textSub }}>score: {bid.score.toFixed(1)}</div>
                          </div>
                          {bid.won && <Trophy size={14} style={{ color: T.gold, flexShrink: 0 }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Event log */}
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
                <div className="px-4 py-3 border-b font-bold text-sm" style={{ background: T.card, borderColor: T.border }}>
                  Log de leilões
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {events.slice(1, 15).map(ev => {
                    const tier = TIERS.find(t => t.id === ev.winner.tier)!;
                    return (
                      <div key={ev.slot} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0 text-sm"
                        style={{ borderColor: T.border }}>
                        <span className="w-10 text-xs font-mono" style={{ color: T.textSub }}>#{ev.slot}</span>
                        <span className="flex-1 truncate">{ev.winner.advertiser}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: tier.color + "20", color: tier.color }}>{tier.label}</span>
                        <span className="font-bold" style={{ color: T.gold }}>R${ev.winner.cpm.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tier distribution pie-like */}
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold text-sm mb-4">Distribuição de vencedores</h3>
                <div className="space-y-3">
                  {tierCounts.map(t => {
                    const pct = slotCount > 0 ? (t.count / slotCount) * 100 : 0;
                    return (
                      <div key={t.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: t.color }}>{t.label}</span>
                          <span style={{ color: T.text }}>{t.count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: T.panel }}>
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: t.color }} />
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>Meta: {t.weight}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold text-sm mb-4">CPM por slot</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <AreaChart data={revenueHistory}>
                    <defs>
                      <linearGradient key="aae-cpm" id="aae-cpm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.gold} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={T.gold} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`R$${v.toFixed(2)}`, "CPM"]} />
                    <Area key="area-cpm" type="monotone" dataKey="cpm" stroke={T.gold} fill="url(#aae-cpm)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Stats tab */}
        {tab === "stats" && events.length > 0 && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Vitórias por anunciante (top 5)</h3>
              <div className="space-y-3">
                {Object.entries(
                  events.reduce((acc, e) => { acc[e.winner.advertiser] = (acc[e.winner.advertiser] || 0) + 1; return acc; }, {} as Record<string, number>)
                ).sort((a,b) => b[1]-a[1]).slice(0,5).map(([name, wins], i) => (
                  <div key={name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate">{name}</span>
                      <span className="font-bold ml-2" style={{ color: T.primary }}>{wins} slots</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.panel }}>
                      <div className="h-full rounded-full" style={{ width: `${(wins / events.length) * 100}%`, background: T.primary }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Receita acumulada</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={revenueHistory}>
                  <defs>
                    <linearGradient key="aae-rev" id="aae-rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.success} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="slot" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`R$${v.toFixed(4)}`, "Receita/slot"]} />
                  <Area key="area-rev" type="monotone" dataKey="rev" stroke={T.success} fill="url(#aae-rev)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tiers tab */}
        {tab === "tiers" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black text-lg mb-2">Lottery Ponderado DOOHPLAY</h3>
              <p className="text-sm mb-5" style={{ color: T.textSub }}>
                Cada slot de 15 segundos é alocado via lottery com peso por tier. Anunciantes Premium têm 60% de chance de ganhar qualquer slot, mas todos os tiers competem pelo espaço.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {TIERS.map(t => (
                  <div key={t.id} className="p-5 rounded-2xl border"
                    style={{ background: T.panel, borderColor: t.color + "30" }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: t.color + "20" }}>
                        <t.icon size={18} style={{ color: t.color }} />
                      </div>
                      <div>
                        <div className="font-black text-base" style={{ color: t.color }}>Tier {t.label}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>CPM base: R${t.cpm}</div>
                      </div>
                      <div className="ml-auto font-black text-3xl" style={{ color: t.color }}>{t.weight}%</div>
                    </div>
                    {/* Weight bar */}
                    <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: T.card }}>
                      <div className="h-full rounded-full" style={{ width: `${t.weight}%`, background: t.color }} />
                    </div>
                    <div className="text-xs" style={{ color: T.textSub }}>
                      {t.id === "premium"  && "Anunciantes com maior investimento mensal. Garantem maior visibilidade."}
                      {t.id === "standard" && "Anunciantes recorrentes com contratos mensais activos."}
                      {t.id === "basic"    && "Campanhas avulsas e anunciantes em período de teste."}
                      {t.id === "fallback" && "Conteúdo default DOOHPLAY quando nenhum lances cobre o CPM mínimo."}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-3">Fórmula de scoring</h3>
              <div className="p-4 rounded-xl font-mono text-sm" style={{ background: T.panel }}>
                <span style={{ color: T.gold }}>score</span>
                <span style={{ color: T.text }}> = </span>
                <span style={{ color: T.primary }}>cpm</span>
                <span style={{ color: T.text }}> × (</span>
                <span style={{ color: T.accent }}>weight</span>
                <span style={{ color: T.text }}> / 100) × </span>
                <span style={{ color: T.success }}>random(0.8–1.2)</span>
              </div>
              <p className="text-xs mt-2" style={{ color: T.textSub }}>
                O fator aleatório garante que anunciantes de tier menor ainda possam vencer ocasionalmente, criando um mercado justo e imprevisível que maximiza receita a longo prazo.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
