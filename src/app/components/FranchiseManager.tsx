import { useState } from "react";
import {
  ArrowLeft, Building2, Tv, DollarSign, TrendingUp, MapPin, Users,
  ChevronRight, BarChart2, Plus, Settings, AlertCircle, CheckCircle,
  Eye, Download, Filter, RefreshCw, Crown
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

type FranchiseView = "overview" | "unit" | "compare" | "alerts";

interface Unit {
  id: string;
  name: string;
  city: string;
  neighborhood: string;
  manager: string;
  screens: number;
  status: "active" | "warning" | "offline";
  fillRate: number;
  monthlyRevenue: number;
  impressions: number;
  avgCpm: number;
  uptime: number;
  rank: number;
  trend: number;
}

interface Franchise {
  id: string;
  name: string;
  segment: string;
  logo: string;
  plan: "pro" | "enterprise";
  totalUnits: number;
  activeUnits: number;
  totalScreens: number;
  monthlyRevenue: number;
  totalImpressions: number;
  avgFillRate: number;
  units: Unit[];
}

const FRANCHISES: Franchise[] = [
  {
    id: "f1",
    name: "FitSpace Academia",
    segment: "Academia",
    logo: "🏋️",
    plan: "enterprise",
    totalUnits: 8,
    activeUnits: 8,
    totalScreens: 24,
    monthlyRevenue: 14820,
    totalImpressions: 482000,
    avgFillRate: 91,
    units: [
      { id: "u1", name: "FitSpace Pinheiros",    city: "São Paulo", neighborhood: "Pinheiros",    manager: "Lucas M.",   screens: 4, status: "active",  fillRate: 97, monthlyRevenue: 2480, impressions: 72000, avgCpm: 42, uptime: 99.8, rank: 1, trend: 12  },
      { id: "u2", name: "FitSpace Vila Madalena", city: "São Paulo", neighborhood: "V. Madalena",  manager: "Carla R.",   screens: 3, status: "active",  fillRate: 94, monthlyRevenue: 1940, impressions: 58000, avgCpm: 40, uptime: 99.2, rank: 2, trend: 8   },
      { id: "u3", name: "FitSpace Moema",         city: "São Paulo", neighborhood: "Moema",        manager: "Renata F.",  screens: 3, status: "active",  fillRate: 89, monthlyRevenue: 1720, impressions: 51000, avgCpm: 38, uptime: 98.7, rank: 3, trend: -3  },
      { id: "u4", name: "FitSpace ABC Plaza",     city: "Santo André",neighborhood: "Centro",      manager: "Pedro A.",   screens: 3, status: "warning", fillRate: 71, monthlyRevenue: 1340, impressions: 38000, avgCpm: 34, uptime: 94.1, rank: 6, trend: -11 },
      { id: "u5", name: "FitSpace Campinas Norte", city: "Campinas", neighborhood: "Cambuí",       manager: "Thais S.",   screens: 3, status: "active",  fillRate: 88, monthlyRevenue: 1680, impressions: 49000, avgCpm: 37, uptime: 99.4, rank: 4, trend: 5   },
      { id: "u6", name: "FitSpace Campinas Sul",   city: "Campinas", neighborhood: "Taquaral",     manager: "Bruno O.",   screens: 2, status: "active",  fillRate: 86, monthlyRevenue: 1220, impressions: 34000, avgCpm: 36, uptime: 99.0, rank: 5, trend: 2   },
      { id: "u7", name: "FitSpace Santos",         city: "Santos",   neighborhood: "Gonzaga",      manager: "Ana P.",     screens: 3, status: "active",  fillRate: 84, monthlyRevenue: 1540, impressions: 46000, avgCpm: 35, uptime: 98.5, rank: 7, trend: 6   },
      { id: "u8", name: "FitSpace Ribeirão Preto", city: "Ribeirão", neighborhood: "Centro",       manager: "Igor C.",    screens: 3, status: "offline", fillRate: 0,  monthlyRevenue: 0,    impressions: 0,     avgCpm: 0,  uptime: 0,    rank: 8, trend: 0   },
    ],
  },
];

const REVENUE_HISTORY = [
  { month: "Fev", revenue: 9200 }, { month: "Mar", revenue: 10800 },
  { month: "Abr", revenue: 11400 }, { month: "Mai", revenue: 12900 },
  { month: "Jun", revenue: 13600 }, { month: "Jul", revenue: 14820 },
];

const UNIT_COMPARE = [
  { name: "Pinheiros",   revenue: 2480, fill: 97 },
  { name: "V. Madalena", revenue: 1940, fill: 94 },
  { name: "Moema",       revenue: 1720, fill: 89 },
  { name: "ABC Plaza",   revenue: 1340, fill: 71 },
  { name: "Cps Norte",   revenue: 1680, fill: 88 },
  { name: "Cps Sul",     revenue: 1220, fill: 86 },
  { name: "Santos",      revenue: 1540, fill: 84 },
];

const STATUS_CFG = {
  active:  { label: "Ativa",    color: T.success, bg: T.success + "15" },
  warning: { label: "Atenção",  color: T.warning, bg: T.warning + "15" },
  offline: { label: "Offline",  color: T.danger,  bg: T.danger  + "15" },
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

export default function FranchiseManager({ onBack, onNavigate }: Props) {
  const [fView, setFView] = useState<FranchiseView>("overview");
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [franchise] = useState(FRANCHISES[0]);

  const openUnit = (u: Unit) => { setSelectedUnit(u); setFView("unit"); };

  if (fView === "unit" && selectedUnit) {
    const s = STATUS_CFG[selectedUnit.status];
    return (
      <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
        <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-4">
            <button onClick={() => setFView("overview")} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div>
              <h1 className="font-black">{selectedUnit.name}</h1>
              <p className="text-xs" style={{ color: T.textSub }}>{selectedUnit.neighborhood} · {selectedUnit.city}</p>
            </div>
            <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold" style={{ background: s.bg, color: s.color }}>{s.label}</span>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Receita/mês",  value: `R$${selectedUnit.monthlyRevenue.toLocaleString("pt-BR")}`, color: T.success },
              { label: "Fill Rate",    value: `${selectedUnit.fillRate}%`,  color: selectedUnit.fillRate > 80 ? T.success : T.warning },
              { label: "Impressões",   value: `${(selectedUnit.impressions / 1000).toFixed(0)}K`, color: T.primary },
              { label: "CPM médio",    value: `R$${selectedUnit.avgCpm}`,   color: T.accent },
              { label: "Uptime",       value: `${selectedUnit.uptime}%`,    color: selectedUnit.uptime > 98 ? T.success : T.danger },
              { label: "Telas",        value: String(selectedUnit.screens), color: T.text },
            ].map((k, i) => (
              <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="text-xs mb-1" style={{ color: T.textSub }}>{k.label}</div>
                <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>
          {selectedUnit.status === "warning" && (
            <div className="p-4 rounded-2xl border" style={{ background: T.warning + "08", borderColor: T.warning + "30" }}>
              <div className="flex items-start gap-3">
                <AlertCircle size={16} style={{ color: T.warning, marginTop: 1 }} />
                <div>
                  <div className="font-bold text-sm mb-1" style={{ color: T.warning }}>Fill rate abaixo da meta</div>
                  <p className="text-sm" style={{ color: T.textSub }}>Esta unidade está 20pp abaixo da média da rede. Verifique os preços de CPM e a cobertura de campanhas.</p>
                </div>
              </div>
            </div>
          )}
          {selectedUnit.status === "offline" && (
            <div className="p-4 rounded-2xl border" style={{ background: T.danger + "08", borderColor: T.danger + "30" }}>
              <div className="font-bold text-sm mb-1" style={{ color: T.danger }}>🔴 Unidade offline</div>
              <p className="text-sm" style={{ color: T.textSub }}>Todas as telas estão desconectadas. Contate o gerente {selectedUnit.manager} para verificar a conexão.</p>
              <button className="mt-3 px-4 py-2 rounded-xl text-sm font-bold" style={{ background: T.danger + "20", color: T.danger }}>Enviar alerta ao gerente</button>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={() => onNavigate?.("device-manager")}
              className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ background: T.primary + "15", color: T.primary, border: `1px solid ${T.primary}25` }}>
              Ver Dispositivos
            </button>
            <button onClick={() => onNavigate?.("analytics-dashboard")}
              className="flex-1 py-3 rounded-xl font-bold text-sm" style={{ background: T.card, color: T.text, border: `1px solid ${T.border}` }}>
              Analytics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: T.primary + "20" }}>
              {franchise.logo}
            </div>
            <div>
              <h1 className="font-black text-lg">Gestão de Rede</h1>
              <p className="text-xs" style={{ color: T.textSub }}>{franchise.name} · {franchise.totalUnits} unidades</p>
            </div>
          </div>
          <button className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold"
            style={{ background: T.primary + "15", color: T.primary, border: `1px solid ${T.primary}25` }}>
            <Plus size={14} /> Nova unidade
          </button>
        </div>
        <div className="max-w-3xl mx-auto px-6 pb-0 flex gap-1">
          {([["overview","Visão Geral"],["compare","Comparativo"],["alerts","Alertas"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setFView(id)}
              className="px-5 py-2.5 text-sm font-medium border-b-2 transition-all"
              style={{ borderColor: fView === id ? T.primary : "transparent", color: fView === id ? T.primary : T.textSub }}>
              {label}
              {id === "alerts" && franchise.units.filter(u => u.status !== "active").length > 0 && (
                <span className="ml-2 px-1.5 rounded-full text-xs font-black" style={{ background: T.danger, color: "#fff" }}>
                  {franchise.units.filter(u => u.status !== "active").length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {fView === "overview" && (
          <>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Receita total",    value: `R$${(franchise.monthlyRevenue / 1000).toFixed(1)}K`, sub: "/mês",       color: T.success, icon: DollarSign },
                { label: "Total impressões", value: `${(franchise.totalImpressions / 1000).toFixed(0)}K`, sub: "este mês",   color: T.primary, icon: Eye        },
                { label: "Fill rate médio",  value: `${franchise.avgFillRate}%`,                          sub: "da rede",     color: T.accent,  icon: BarChart2  },
                { label: "Telas ativas",     value: `${franchise.totalScreens - 3}/${franchise.totalScreens}`, sub: "online",color: T.success, icon: Tv         },
              ].map((k, i) => {
                const Icon = k.icon;
                return (
                  <div key={i} className="p-3.5 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon size={13} style={{ color: k.color }} />
                      <span className="text-xs" style={{ color: T.textSub }}>{k.label}</span>
                    </div>
                    <div className="font-black text-xl" style={{ color: k.color }}>{k.value}</div>
                    <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.sub}</div>
                  </div>
                );
              })}
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Receita consolidada da rede</h3>
                <span className="text-sm font-black" style={{ color: T.success }}>+61% em 6 meses</span>
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={REVENUE_HISTORY}>
                  <defs>
                    <linearGradient key="fm-rev" id="fm-rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text }} formatter={(v: number) => [`R$${v.toLocaleString("pt-BR")}`, "Receita"]} />
                  <Area type="monotone" dataKey="revenue" key="fm-area-rev" stroke={T.success} fill="url(#fm-rev)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">Unidades ({franchise.totalUnits})</h3>
                <span className="text-xs" style={{ color: T.textSub }}>ordenado por receita</span>
              </div>
              <div className="space-y-2">
                {franchise.units.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).map((unit, i) => {
                  const s = STATUS_CFG[unit.status];
                  return (
                    <button key={unit.id} onClick={() => openUnit(unit)} className="w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all hover:border-opacity-60"
                      style={{ background: T.card, borderColor: T.border }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                        style={{ background: i === 0 ? T.gold + "20" : T.panel, color: i === 0 ? T.gold : T.textSub }}>
                        {i === 0 ? "👑" : `#${i + 1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{unit.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: T.textSub }}>
                          {unit.neighborhood} · {unit.screens} telas · {unit.manager}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-black text-sm" style={{ color: unit.status === "offline" ? T.textSub : T.success }}>
                          {unit.status === "offline" ? "—" : `R$${unit.monthlyRevenue.toLocaleString("pt-BR")}`}
                        </div>
                        <div className="text-xs" style={{ color: unit.fillRate > 80 ? T.success : T.warning }}>
                          {unit.status === "offline" ? "offline" : `${unit.fillRate}% fill`}
                        </div>
                      </div>
                      <ChevronRight size={16} style={{ color: T.textSub }} />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {fView === "compare" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Receita por unidade — Julho 2026</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={UNIT_COMPARE} barSize={28}>
                  <XAxis dataKey="name" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text }} formatter={(v: number) => [`R$${v.toLocaleString("pt-BR")}`, "Receita"]} />
                  <Bar dataKey="revenue" key="fm-bar-rev" fill={T.primary} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Fill Rate por unidade</h3>
              <div className="space-y-3">
                {UNIT_COMPARE.sort((a, b) => b.fill - a.fill).map((u, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-24 text-xs font-medium truncate" style={{ color: T.text }}>{u.name}</span>
                    <div className="flex-1 h-3 rounded-full" style={{ background: T.border }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${u.fill}%`, background: u.fill > 88 ? T.success : u.fill > 75 ? T.warning : T.danger }} />
                    </div>
                    <span className="w-10 text-right text-xs font-black" style={{ color: u.fill > 88 ? T.success : u.fill > 75 ? T.warning : T.danger }}>{u.fill}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-2xl border" style={{ background: T.primary + "08", borderColor: T.primary + "25" }}>
              <div className="font-bold text-sm mb-2">💡 Insight da rede</div>
              <p className="text-sm" style={{ color: T.textSub }}>
                <strong style={{ color: T.text }}>FitSpace Pinheiros</strong> rende 85% mais que a média da rede. Replicar a estratégia de precificação e playlist desta unidade pode gerar <strong style={{ color: T.success }}>+R$3.200/mês</strong> nas demais.
              </p>
            </div>
          </div>
        )}

        {fView === "alerts" && (
          <div className="space-y-3">
            {franchise.units.filter(u => u.status !== "active").map(unit => {
              const s = STATUS_CFG[unit.status];
              return (
                <div key={unit.id} className="p-4 rounded-2xl border" style={{ background: s.bg.replace("15", "08"), borderColor: s.color + "30" }}>
                  <div className="flex items-start gap-3">
                    <AlertCircle size={16} style={{ color: s.color, marginTop: 1 }} />
                    <div className="flex-1">
                      <div className="font-bold text-sm">{unit.name}</div>
                      <div className="text-xs mb-2" style={{ color: T.textSub }}>
                        {unit.status === "offline" ? "Todas as telas offline · Verificar conexão" : `Fill rate em ${unit.fillRate}% — abaixo da meta de 85%`}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openUnit(unit)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: s.color + "20", color: s.color }}>
                          Ver unidade
                        </button>
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: T.panel, color: T.textSub }}>
                          Notificar gerente
                        </button>
                      </div>
                    </div>
                    <div className="text-xs" style={{ color: T.textSub }}>há 2h</div>
                  </div>
                </div>
              );
            })}
            {franchise.units.filter(u => u.status !== "active").length === 0 && (
              <div className="text-center py-16">
                <CheckCircle size={40} className="mx-auto mb-3" style={{ color: T.success, opacity: 0.4 }} />
                <p style={{ color: T.textSub }}>Todas as unidades operando normalmente.</p>
              </div>
            )}
            <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h4 className="font-bold text-sm mb-3">Histórico de alertas (últimos 30 dias)</h4>
              {[
                { date: "20 Jul", type: "offline",  unit: "FitSpace Ribeirão", duration: "14h" },
                { date: "17 Jul", type: "warning",  unit: "FitSpace ABC",      duration: "3 dias" },
                { date: "12 Jul", type: "offline",  unit: "FitSpace Santos",   duration: "2h" },
              ].map((a, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 border-b last:border-0" style={{ borderColor: T.border }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.type === "offline" ? T.danger : T.warning }} />
                  <span className="text-sm flex-1">{a.unit}</span>
                  <span className="text-xs" style={{ color: T.textSub }}>{a.duration}</span>
                  <span className="text-xs" style={{ color: T.textSub }}>{a.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border p-5 flex items-center gap-4" style={{ background: T.card, borderColor: T.border }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: T.gold + "15" }}>🏢</div>
          <div className="flex-1">
            <div className="font-bold text-sm">Gerenciar outra rede</div>
            <div className="text-xs" style={{ color: T.textSub }}>Adicione redes de outros segmentos à sua conta multi-franquia.</div>
          </div>
          <button className="px-4 py-2 rounded-xl text-sm font-bold flex-shrink-0" style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
            + Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
