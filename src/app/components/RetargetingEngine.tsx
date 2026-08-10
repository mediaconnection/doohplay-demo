import { useState } from "react";
import {
  ArrowLeft, Target, Users, Globe, Zap, TrendingUp, Eye, Link2,
  Plus, Copy, CheckCircle, ToggleLeft, BarChart2, RefreshCw,
  Smartphone, Monitor, X, Code2, Download
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type AudienceStatus = "active" | "building" | "paused" | "ready";
type Platform = "meta" | "google" | "tiktok" | "programmatic";

interface Audience {
  id: string;
  name: string;
  description: string;
  size: number;
  screen: string;
  campaign: string;
  platform: Platform;
  status: AudienceStatus;
  matchRate: number;
  ctr: number;
  convRate: number;
}

const PLATFORM_META: Record<Platform, { label: string; color: string }> = {
  meta:          { label: "Meta Ads",     color: "#1877F2" },
  google:        { label: "Google Ads",   color: "#4285F4" },
  tiktok:        { label: "TikTok Ads",   color: "#FE2C55" },
  programmatic:  { label: "Programático", color: T.accent  },
};

const STATUS_META: Record<AudienceStatus, { label: string; color: string }> = {
  active:   { label: "Ativa",         color: T.success },
  building: { label: "Construindo",   color: T.warning },
  paused:   { label: "Pausada",       color: T.textSub },
  ready:    { label: "Pronta",        color: T.primary },
};

const AUDIENCES: Audience[] = [
  { id: "A1", name: "Viu Ambev Shopping Ibirapuera",     description: "Expostos à campanha Ambev no shopping",    size: 42000, screen: "Shopping Ibirapuera", campaign: "Ambev Verão",   platform: "meta",          status: "active",   matchRate: 74, ctr: 3.2, convRate: 1.8 },
  { id: "A2", name: "Passaram pelo metrô Paulista",      description: "Audiência do metrô linha 2-verde",         size: 28500, screen: "Metro Paulista",      campaign: "Bradesco Ads",  platform: "google",        status: "active",   matchRate: 68, ctr: 2.8, convRate: 1.4 },
  { id: "A3", name: "Aeroporto GRU — alto CPM",         description: "Executivos expostos no GRU T2",            size: 9200,  screen: "GRU Terminal 2",      campaign: "iFood Premium", platform: "programmatic",  status: "ready",    matchRate: 81, ctr: 4.1, convRate: 2.6 },
  { id: "A4", name: "Rodoviária Tietê — mobilidade",    description: "Usuários de transporte interestadual",     size: 18700, screen: "Rodoviária Tietê",    campaign: "Carrefour Jul", platform: "meta",          status: "building", matchRate: 55, ctr: 0,   convRate: 0   },
  { id: "A5", name: "Av. Paulista — perfil premium",    description: "Pedestres e motoristas da Av. Paulista",   size: 65000, screen: "Av. Paulista Geral",  campaign: "Nivea UV",      platform: "tiktok",        status: "active",   matchRate: 70, ctr: 5.3, convRate: 3.1 },
  { id: "A6", name: "Shopping Iguatemi — luxo",         description: "Frequentadores de malls premium",          size: 12300, screen: "Shopping Iguatemi",   campaign: "Unilever Q3",   platform: "google",        status: "paused",   matchRate: 77, ctr: 0,   convRate: 0   },
];

const FUNNEL_DATA = [
  { stage: "Expostos OOH",       value: 175700 },
  { stage: "Pixel Sync",         value: 112400 },
  { stage: "Audiência Match",    value: 80900  },
  { stage: "Alcançados Digital", value: 62000  },
  { stage: "Convertidos",        value: 3100   },
];

const TREND_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${13 - i}`,
  matched: 4000 + i * 1200 + Math.floor(Math.random() * 800),
  converted: 150 + i * 30 + Math.floor(Math.random() * 40),
}));

const PIE_DATA = [
  { name: "Meta Ads",     value: 44, color: "#1877F2" },
  { name: "Google Ads",   value: 31, color: "#4285F4" },
  { name: "TikTok Ads",   value: 15, color: "#FE2C55" },
  { name: "Programático", value: 10, color: T.accent  },
];

export default function RetargetingEngine({ onBack, onNavigate }: Props) {
  const [tab, setTab]           = useState<"audiences" | "pixel" | "funnel">("audiences");
  const [selected, setSelected] = useState<Audience | null>(null);
  const [copied, setCopied]     = useState<string | null>(null);

  function copySnippet(id: string) {
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const totalAudience = AUDIENCES.reduce((s, a) => s + (a.status !== "paused" ? a.size : 0), 0);
  const avgMatch      = Math.round(AUDIENCES.filter(a => a.status === "active").reduce((s, a) => s + a.matchRate, 0) / AUDIENCES.filter(a => a.status === "active").length);
  const totalConv     = 3100;

  const PIXEL_SNIPPET = `<!-- DOOHPLAY Retargeting Pixel -->
<script>
  !function(d,o,o2,h,p,l,a,y){
    d[h]=d[h]||function(){(d[h].q=d[h].q||[]).push(arguments)};
    p=o.createElement(o2);p.async=1;
    p.src='https://cdn.doohplay.com.br/px.js';
    l=o.getElementsByTagName(o2)[0];
    l.parentNode.insertBefore(p,l);
  }(window,document,'script','doohpx');
  doohpx('init','DPX-ABC123-XYZ');
  doohpx('track','pageview');
</script>`;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.accent + "20" }}>
                <Target size={18} style={{ color: T.accent }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Retargeting Engine</h1>
                <p className="text-xs" style={{ color: T.textSub }}>DOOH → Digital: sincronize audiências vistas em tela com campanhas online</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["audiences","pixel","funnel"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.accent + "20" : "transparent", color: tab === t ? T.accent : T.textSub, border: `1px solid ${tab === t ? T.accent + "30" : "transparent"}` }}>
                {t === "audiences" ? "Audiências" : t === "pixel" ? "Pixel & SDK" : "Funil"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Audiência Total",     value: `${(totalAudience / 1000).toFixed(0)}k`, color: T.accent,   icon: Users },
            { label: "Taxa de Match Média", value: `${avgMatch}%`,                          color: T.success,  icon: Link2 },
            { label: "Conversões (30d)",    value: totalConv.toLocaleString("pt-BR"),       color: T.primary,  icon: TrendingUp },
            { label: "Plataformas Ativas",  value: 4,                                       color: T.gold,     icon: Globe },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: k.color + "20" }}>
                <k.icon size={15} style={{ color: k.color }} />
              </div>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* AUDIENCES TAB */}
        {tab === "audiences" && (
          <div className="flex gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-black">Audiências de Retargeting</h2>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black" style={{ background: T.accent, color: "#fff" }}>
                  <Plus size={14} /> Nova Audiência
                </button>
              </div>

              {AUDIENCES.map(aud => {
                const pm  = PLATFORM_META[aud.platform];
                const sm  = STATUS_META[aud.status];
                return (
                  <div key={aud.id} onClick={() => setSelected(selected?.id === aud.id ? null : aud)}
                    className="p-4 rounded-2xl border cursor-pointer hover:bg-white/3 transition-all"
                    style={{ background: T.card, borderColor: selected?.id === aud.id ? T.accent + "60" : T.border }}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: pm.color + "20" }}>
                        <Target size={18} style={{ color: pm.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black">{aud.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: pm.color + "20", color: pm.color }}>{pm.label}</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{aud.description} · {aud.screen}</div>
                        <div className="flex items-center gap-4 mt-2 text-xs">
                          <span><span className="font-black" style={{ color: T.text }}>{aud.size.toLocaleString("pt-BR")}</span> <span style={{ color: T.textSub }}>usuários</span></span>
                          {aud.status !== "building" && (
                            <>
                              <span><span className="font-black" style={{ color: T.success }}>{aud.matchRate}%</span> <span style={{ color: T.textSub }}>match</span></span>
                              <span><span className="font-black" style={{ color: aud.ctr > 0 ? T.primary : T.textSub }}>{aud.ctr > 0 ? `${aud.ctr}%` : "—"}</span> <span style={{ color: T.textSub }}>CTR</span></span>
                              <span><span className="font-black" style={{ color: aud.convRate > 0 ? T.gold : T.textSub }}>{aud.convRate > 0 ? `${aud.convRate}%` : "—"}</span> <span style={{ color: T.textSub }}>conv.</span></span>
                            </>
                          )}
                          {aud.status === "building" && (
                            <span className="flex items-center gap-1" style={{ color: T.warning }}>
                              <RefreshCw size={10} className="animate-spin" /> Sincronizando audiência...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detail panel */}
            {selected && (
              <div className="w-64 flex-shrink-0 p-5 rounded-2xl border space-y-4" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: T.textSub }}>{selected.id}</span>
                  <button onClick={() => setSelected(null)}><X size={13} style={{ color: T.textSub }} /></button>
                </div>
                <div>
                  <div className="font-black text-sm">{selected.name}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{selected.description}</div>
                </div>
                {[
                  { label: "Plataforma",  value: PLATFORM_META[selected.platform].label, color: PLATFORM_META[selected.platform].color },
                  { label: "Campanha",    value: selected.campaign },
                  { label: "Tela",        value: selected.screen },
                  { label: "Usuários",    value: selected.size.toLocaleString("pt-BR") },
                  { label: "Match Rate",  value: `${selected.matchRate}%`, color: T.success },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span style={{ color: T.textSub }}>{r.label}</span>
                    <span className="font-bold" style={{ color: (r as any).color || T.text }}>{r.value}</span>
                  </div>
                ))}
                <div className="space-y-2 pt-2">
                  <button className="w-full py-2 rounded-xl text-xs font-black" style={{ background: T.accent, color: "#fff" }}>
                    Exportar para {PLATFORM_META[selected.platform].label}
                  </button>
                  <button className="w-full py-2 rounded-xl text-xs font-bold" style={{ background: T.border, color: T.textSub }}>
                    Pausar Audiência
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PIXEL TAB */}
        {tab === "pixel" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black">Pixel ID</h3>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: T.success + "20", color: T.success }}>Ativo</span>
                </div>
                <div className="p-3 rounded-xl font-mono text-sm" style={{ background: T.panel }}>DPX-ABC123-XYZ</div>
                <div className="grid grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="p-3 rounded-xl text-center" style={{ background: T.panel }}>
                    <div className="font-black text-lg" style={{ color: T.primary }}>112.4k</div>
                    <div style={{ color: T.textSub }}>pageviews / mês</div>
                  </div>
                  <div className="p-3 rounded-xl text-center" style={{ background: T.panel }}>
                    <div className="font-black text-lg" style={{ color: T.success }}>80.9k</div>
                    <div style={{ color: T.textSub }}>matches / mês</div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Integrações Ativas</h3>
                {[
                  { platform: "Meta Ads",     color: "#1877F2", icon: Globe, audiences: 2, status: "Conectado" },
                  { platform: "Google Ads",   color: "#4285F4", icon: Globe, audiences: 2, status: "Conectado" },
                  { platform: "TikTok Ads",   color: "#FE2C55", icon: Smartphone, audiences: 1, status: "Conectado" },
                  { platform: "Programático", color: T.accent,  icon: Monitor, audiences: 1, status: "Conectado" },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: T.border + "60" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: p.color + "20" }}>
                      <p.icon size={13} style={{ color: p.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold">{p.platform}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{p.audiences} audiências sincronizadas</div>
                    </div>
                    <span className="text-xs font-bold" style={{ color: T.success }}>{p.status}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black">Snippet de Instalação</h3>
                  <button onClick={() => copySnippet("pixel")}
                    className="flex items-center gap-1.5 text-xs font-bold"
                    style={{ color: copied === "pixel" ? T.success : T.primary }}>
                    {copied === "pixel" ? <><CheckCircle size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                  </button>
                </div>
                <pre className="text-xs p-4 rounded-xl overflow-x-auto" style={{ background: T.bg, color: T.textSub, border: `1px solid ${T.border}` }}>
                  {PIXEL_SNIPPET}
                </pre>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-3">Eventos Rastreados</h3>
                {[
                  { event: "pageview",   desc: "Visualização de página",     count: "112.4k" },
                  { event: "purchase",   desc: "Compra realizada",            count: "3.1k"   },
                  { event: "lead",       desc: "Formulário preenchido",       count: "8.2k"   },
                  { event: "add_to_cart",desc: "Adição ao carrinho",          count: "21.7k"  },
                ].map((ev, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 text-xs" style={{ borderColor: T.border + "60" }}>
                    <div>
                      <span className="font-mono font-bold" style={{ color: T.accent }}>{ev.event}</span>
                      <span className="ml-2" style={{ color: T.textSub }}>{ev.desc}</span>
                    </div>
                    <span className="font-black" style={{ color: T.text }}>{ev.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FUNNEL TAB */}
        {tab === "funnel" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Funil DOOH → Conversão</h3>
                <p className="text-xs mb-5" style={{ color: T.textSub }}>Mês atual — usuários únicos</p>
                <div className="space-y-2">
                  {FUNNEL_DATA.map((s, i) => {
                    const pct = Math.round(s.value / FUNNEL_DATA[0].value * 100);
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold">{s.stage}</span>
                          <span className="text-xs font-black" style={{ color: T.accent }}>{s.value.toLocaleString("pt-BR")} <span style={{ color: T.textSub }}>({pct}%)</span></span>
                        </div>
                        <div className="h-6 rounded-lg overflow-hidden" style={{ background: T.border }}>
                          <div className="h-full rounded-lg flex items-center justify-end pr-2 transition-all"
                            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${T.accent}80, ${T.accent})` }}>
                            {pct > 20 && <span className="text-xs font-black text-white">{pct}%</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">Mix por Plataforma</h3>
                <p className="text-xs mb-2" style={{ color: T.textSub }}>% de audiência sincronizada</p>
                <div className="flex items-center justify-center" style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie key="pie-platform" data={PIE_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3}>
                        {PIE_DATA.map((entry, i) => (
                          <Cell key={`cell-p-${i}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PIE_DATA.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                      <span className="text-xs">{p.name}</span>
                      <span className="ml-auto font-bold text-xs">{p.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-black mb-1">Match × Conversões — 14 dias</h3>
              <p className="text-xs mb-4" style={{ color: T.textSub }}>Audiências sincronizadas e convertidas diariamente</p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={TREND_DATA}>
                  <defs>
                    <linearGradient key="grad-m" id="grad-m" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={T.accent} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={T.accent} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient key="grad-c" id="grad-c" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={T.success} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={T.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }} />
                  <Area key="area-matched" type="monotone" dataKey="matched" stroke={T.accent} fill="url(#grad-m)" strokeWidth={2} />
                  <Area key="area-converted" type="monotone" dataKey="converted" stroke={T.success} fill="url(#grad-c)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
