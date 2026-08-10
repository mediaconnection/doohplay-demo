import { useState } from "react";
import { ArrowLeft, Search, Filter, Tv, MapPin, Star, ShoppingBag, CheckCircle2,
  TrendingUp, Eye, DollarSign, Activity, ChevronDown, Globe, ArrowRight } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";

const T = {
  bg: "#020617", card: "#0F172A", cardLight: "#1E293B",
  border: "rgba(255,255,255,0.08)", borderLight: "rgba(255,255,255,0.12)",
  primary: "#2563EB", secondary: "#0EA5E9", success: "#22C55E",
  warning: "#F59E0B", purple: "#8B5CF6", gray: "#64748B",
  text: "#F1F5F9", textSub: "#94A3B8",
};

const trendData = [
  { d: "Seg", v: 62 }, { d: "Ter", v: 71 }, { d: "Qua", v: 68 }, { d: "Qui", v: 84 },
  { d: "Sex", v: 91 }, { d: "Sab", v: 78 }, { d: "Dom", v: 85 },
];

const inventory = [
  { name: "Rede de Padarias SP", city: "Sao Paulo", segment: "Food Service", impressions: "420K", cpm: 18, trust: 97.2, avail: "Alta", screens: 48, icon: "bakery", color: T.success },
  { name: "Rede Farma Nacional", city: "Brasil", segment: "Health", impressions: "850K", cpm: 21, trust: 98.7, avail: "Media", screens: 127, icon: "health", color: T.primary },
  { name: "Shopping Curitiba", city: "Curitiba", segment: "Retail", impressions: "1.2M", cpm: 26, trust: 99.4, avail: "Alta", screens: 64, icon: "retail", color: T.secondary },
  { name: "Academia Fit Network", city: "Rio de Janeiro", segment: "Fitness", impressions: "310K", cpm: 15, trust: 96.8, avail: "Alta", screens: 32, icon: "fitness", color: T.warning },
  { name: "Supermercado Horizonte", city: "Belo Horizonte", segment: "Retail", impressions: "680K", cpm: 19, trust: 97.5, avail: "Baixa", screens: 89, icon: "market", color: T.purple },
];

const availColor = (a: string) => a === "Alta" ? T.success : a === "Media" ? T.warning : "#EF4444";

export default function MediaMarketplace({ onBack }: { onBack: () => void }) {
  const [search, setSearch] = useState("");
  const [segFilter, setSegFilter] = useState("Todos");
  const [sortBy, setSortBy] = useState("impressions");
  const segs = ["Todos", "Food Service", "Health", "Retail", "Fitness"];

  const filtered = inventory.filter(i =>
    (segFilter === "Todos" || i.segment === segFilter) &&
    (search === "" || i.name.toLowerCase().includes(search.toLowerCase()) || i.city.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <header className="sticky top-0 z-50 px-6 py-4 border-b flex items-center gap-4" style={{ background: `${T.bg}F0`, borderColor: T.border, backdropFilter: "blur(20px)" }}>
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/5" style={{ color: T.textSub }}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.primary }}><ShoppingBag size={16} color="#fff" /></div>
          <div>
            <div className="font-bold text-lg leading-none" style={{ color: T.text }}>Media Marketplace</div>
            <div className="text-xs mt-0.5" style={{ color: T.textSub }}>Inventario programatico auditavel</div>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl ml-4" style={{ background: T.card, border: `1px solid ${T.border}` }}>
          <Search size={16} style={{ color: T.gray }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cidade, rede, segmento..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: T.text }} />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ background: T.primary, color: "#fff" }}>
          <ShoppingBag size={15} /> Comprar Inventario
        </button>
      </header>

      <div className="px-6 py-4 border-b" style={{ borderColor: T.border }}>
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4">
          {[
            { l: "Inventario Disponivel", v: "12.847 telas", i: Tv, c: T.primary },
            { l: "Impressoes Disponiveis", v: "84.2M", i: Eye, c: T.secondary },
            { l: "Trust Medio", v: "97.3", i: Star, c: T.warning },
            { l: "CPM Medio", v: "R$18", i: DollarSign, c: T.success },
          ].map((k, i) => (
            <div key={`mkpi-${i}`} className="flex items-center gap-3 p-4 rounded-2xl border" style={{ background: T.card, borderColor: `${k.c}25` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${k.c}18` }}><k.i size={20} style={{ color: k.c }} /></div>
              <div><div className="text-xl font-bold" style={{ color: T.text }}>{k.v}</div><div className="text-xs" style={{ color: T.textSub }}>{k.l}</div></div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        <aside className="w-56 flex-shrink-0">
          <div className="rounded-2xl border p-4" style={{ background: T.card, borderColor: T.border }}>
            <div className="flex items-center gap-2 mb-4 text-sm font-bold" style={{ color: T.text }}><Filter size={14} style={{ color: T.primary }} /> Filtros</div>
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2" style={{ color: T.textSub }}>Segmento</div>
              <div className="flex flex-col gap-1">
                {segs.map(o => (
                  <button key={o} onClick={() => setSegFilter(o)} className="text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: segFilter === o ? `${T.primary}20` : "transparent", color: segFilter === o ? T.primary : T.textSub }}>{o}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm" style={{ color: T.textSub }}>{filtered.length} redes disponiveis</div>
            <div className="flex items-center gap-2 text-xs" style={{ color: T.textSub }}>
              Ordenar por:
              {["impressions", "cpm", "trust"].map(s => (
                <button key={s} onClick={() => setSortBy(s)} className="px-3 py-1.5 rounded-lg font-semibold transition-all capitalize" style={{ background: sortBy === s ? T.primary : T.card, color: sortBy === s ? "#fff" : T.textSub }}>
                  {s === "impressions" ? "Impressoes" : s === "cpm" ? "CPM" : "Trust"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((inv, i) => (
              <div key={`inv-${i}`} className="rounded-2xl border overflow-hidden transition-all hover:-translate-y-1" style={{ background: T.card, borderColor: T.border }}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: inv.color + "20" }}><Tv size={16} style={{ color: inv.color }} /></div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: T.text }}>{inv.name}</div>
                        <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: T.textSub }}><MapPin size={10} />{inv.city}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${availColor(inv.avail)}18`, color: availColor(inv.avail) }}>{inv.avail}</span>
                  </div>
                  <div className="h-16 mb-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs><linearGradient id={`mg-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={inv.color} stopOpacity={0.3} /><stop offset="100%" stopColor={inv.color} stopOpacity={0} /></linearGradient></defs>
                        <Area type="monotone" dataKey="v" stroke={inv.color} strokeWidth={1.5} fill={`url(#mg-${i})`} dot={false} />
                        <Tooltip contentStyle={{ background: T.cardLight, border: "none", borderRadius: 8, fontSize: 10, color: T.text }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[{ l: "Impressoes", v: inv.impressions }, { l: "CPM", v: `R$${inv.cpm}` }, { l: "Trust", v: inv.trust.toString() }].map((m, j) => (
                      <div key={`im-${i}-${j}`} className="text-center p-2 rounded-lg" style={{ background: T.cardLight }}>
                        <div className="text-sm font-bold" style={{ color: j === 1 ? T.success : j === 2 ? T.warning : T.secondary }}>{m.v}</div>
                        <div className="text-xs" style={{ color: T.gray }}>{m.l}</div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 flex items-center justify-center gap-2" style={{ background: `${inv.color}18`, color: inv.color, border: `1px solid ${inv.color}30` }}>
                    <ShoppingBag size={14} /> Comprar Inventario <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
