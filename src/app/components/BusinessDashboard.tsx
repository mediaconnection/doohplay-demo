import { useState } from "react";
import {
  LayoutDashboard, Building2, Monitor, Megaphone, FileVideo, DollarSign,
  BarChart2, Bell, AlertCircle, Settings, Plus, TrendingUp,
  MapPin, Star, ChevronRight, Wifi, WifiOff, ChevronDown,
  Calendar, Filter, Download, CheckCircle2, Clock, Eye, Play, Pause
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line, AreaChart, Area } from "recharts";
import { Sidebar } from "./shared/Sidebar";
import { MobileNav } from "./shared/MobileNav";
import { KPICard } from "./shared/KPICard";
import { StatusBadge } from "./shared/StatusBadge";

const navItems = [
  { label: "Overview", icon: LayoutDashboard, id: "overview" },
  { label: "Unidades", icon: Building2, id: "units", badge: 8 },
  { label: "Telas", icon: Monitor, id: "screens", badge: 24 },
  { label: "Campanhas", icon: Megaphone, id: "campaigns" },
  { label: "Conteúdo", icon: FileVideo, id: "content" },
  { label: "Receita", icon: DollarSign, id: "revenue" },
  { label: "Relatórios", icon: BarChart2, id: "reports" },
  { label: "Alertas", icon: AlertCircle, id: "alerts", badge: 2 },
  { label: "Configurações", icon: Settings, id: "settings" },
];

const revenueByUnit = [
  { unit: "SP Centro", valor: 3200 }, { unit: "SP Sul", valor: 2800 },
  { unit: "Campinas", valor: 2100 }, { unit: "Santos", valor: 1800 },
  { unit: "Sorocaba", valor: 1200 }, { unit: "Osasco", valor: 950 },
];

const networkTrend = [
  { day: "Seg", online: 22, offline: 2 }, { day: "Ter", online: 23, offline: 1 },
  { day: "Qua", online: 24, offline: 0 }, { day: "Qui", online: 21, offline: 3 },
  { day: "Sex", online: 24, offline: 0 }, { day: "Sáb", online: 20, offline: 4 }, { day: "Dom", online: 22, offline: 2 },
];

const monthlyRevenue = [
  { mes: "Jan", valor: 8200 }, { mes: "Fev", valor: 9400 }, { mes: "Mar", valor: 8900 },
  { mes: "Abr", valor: 10200 }, { mes: "Mai", valor: 10500 }, { mes: "Jun", valor: 12400 },
];

const units = [
  { name: "Filial SP Centro", city: "São Paulo", screens: 4, online: 4, revenue: "R$ 3.200", sla: "99.2%", status: "online" as const, trend: "+12%" },
  { name: "Filial SP Sul", city: "São Paulo", screens: 3, online: 3, revenue: "R$ 2.800", sla: "98.7%", status: "online" as const, trend: "+8%" },
  { name: "Filial Campinas", city: "Campinas", screens: 4, online: 3, revenue: "R$ 2.100", sla: "95.1%", status: "warning" as const, trend: "+3%" },
  { name: "Filial Santos", city: "Santos", screens: 3, online: 3, revenue: "R$ 1.800", sla: "99.5%", status: "online" as const, trend: "+15%" },
  { name: "Filial Sorocaba", city: "Sorocaba", screens: 2, online: 1, revenue: "R$ 1.200", sla: "72.3%", status: "warning" as const, trend: "-5%" },
  { name: "Filial Osasco", city: "Osasco", screens: 2, online: 0, revenue: "R$ 0", sla: "0%", status: "offline" as const, trend: "—" },
];

const campaigns = [
  { name: "Black Friday Nacional", region: "Todas as unidades", status: "active" as const, impressions: "124.500", end: "30 Nov", budget: "R$ 8.200", progress: 68 },
  { name: "Verão SP Interior", region: "Campinas · Sorocaba", status: "active" as const, impressions: "48.200", end: "31 Dez", budget: "R$ 3.400", progress: 42 },
  { name: "Promoção Local Santos", region: "Santos", status: "paused" as const, impressions: "12.800", end: "15 Jun", budget: "R$ 1.100", progress: 85 },
  { name: "Lançamento Produto X", region: "SP Centro · SP Sul", status: "pending" as const, impressions: "—", end: "01 Jul", budget: "R$ 5.000", progress: 0 },
];

const screens = [
  { id: "SCR-0001", unit: "SP Centro", location: "Entrada", status: "online" as const, uptime: "99.9%", lastSync: "1 min" },
  { id: "SCR-0002", unit: "SP Centro", location: "Caixa", status: "online" as const, uptime: "99.7%", lastSync: "2 min" },
  { id: "SCR-0003", unit: "Campinas", location: "Fachada", status: "warning" as const, uptime: "87.2%", lastSync: "15 min" },
  { id: "SCR-0004", unit: "Osasco", location: "Entrada", status: "offline" as const, uptime: "0%", lastSync: "4h" },
  { id: "SCR-0005", unit: "Santos", location: "Vitrine", status: "online" as const, uptime: "99.5%", lastSync: "1 min" },
  { id: "SCR-0006", unit: "Sorocaba", location: "Sala de espera", status: "warning" as const, uptime: "72.1%", lastSync: "32 min" },
];

interface BusinessDashboardProps {
  onBack: () => void;
}

function OverviewView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KPICard title="Unidades ativas" value="7/8" change="1 com alerta" changeType="neutral" icon={Building2} iconColor="#2563EB" iconBg="#EFF6FF" />
        <KPICard title="Telas online" value="20/24" change="-4 offline" changeType="down" icon={Monitor} iconColor="#FF6B00" iconBg="#FFF7ED" />
        <KPICard title="Receita mensal" value="R$ 12.400" change="+18% vs mai" changeType="up" icon={DollarSign} iconColor="#22C55E" iconBg="#DCFCE7" />
        <KPICard title="Campanhas ativas" value="8" change="3 regionais" changeType="neutral" icon={Megaphone} iconColor="#2563EB" iconBg="#EFF6FF" />
        <KPICard title="SLA da rede" value="94.2%" change="-2.1pp" changeType="down" icon={TrendingUp} iconColor="#00A3FF" iconBg="#E0F2FE" />
        <KPICard title="Alertas" value="2" change="1 crítico" changeType="down" icon={AlertCircle} iconColor="#EF4444" iconBg="#FEE2E2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Receita por unidade — Junho</h3>
              <p className="text-xs text-muted-foreground">Total: R$ 12.400</p>
            </div>
            <button className="text-sm text-[#2563EB] font-medium hover:underline flex items-center gap-1">
              Por unidade <ChevronRight size={14} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueByUnit} barSize={32}>
              <XAxis dataKey="unit" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v) => [`R$ ${v}`, "Receita"]} contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Bar key="bar-valor" dataKey="valor" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Status da rede (7 dias)</h3>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={networkTrend}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 11 }} />
              <Line key="line-online" type="monotone" dataKey="online" stroke="#22C55E" strokeWidth={2} dot={false} name="Online" />
              <Line key="line-offline" type="monotone" dataKey="offline" stroke="#EF4444" strokeWidth={2} dot={false} name="Offline" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 flex gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#22C55E]"><span className="w-3 h-0.5 bg-[#22C55E] rounded inline-block" /> Online</span>
            <span className="flex items-center gap-1.5 text-[#EF4444]"><span className="w-3 h-0.5 bg-[#EF4444] rounded inline-block" /> Offline</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Ranking de unidades</h3>
          <Star size={16} className="text-[#FACC15]" />
        </div>
        <div className="space-y-2">
          {units.slice(0, 4).map((unit, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary transition-colors">
              <span className="text-sm font-mono font-bold text-muted-foreground w-5">#{i + 1}</span>
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <MapPin size={15} className="text-[#2563EB]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{unit.name}</p>
                <p className="text-xs text-muted-foreground">{unit.screens} telas · <span className={unit.online === unit.screens ? "text-[#22C55E]" : "text-[#FF6B00]"}>{unit.online} online</span></p>
              </div>
              <StatusBadge status={unit.status} />
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-foreground">{unit.revenue}</p>
                <p className="text-xs" style={{ color: unit.trend.startsWith("+") ? "#22C55E" : unit.trend === "—" ? "#94A3B8" : "#EF4444" }}>{unit.trend}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-xl p-4 flex items-start gap-3">
        <AlertCircle size={20} className="text-[#FF6B00] shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-[#C2410C]">2 alertas operacionais pendentes</p>
          <p className="text-sm text-[#C2410C]/80 mt-1">Filial Osasco offline (4h) · Filial Sorocaba com 1 tela sem sinal</p>
        </div>
        <button className="px-3 py-2 rounded-lg text-sm font-semibold text-white bg-[#FF6B00] hover:opacity-90 transition-opacity shrink-0">Ver alertas</button>
      </div>
    </div>
  );
}

function UnidadesView() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Unidades da Rede</h2>
          <p className="text-sm text-muted-foreground">8 unidades · 24 telas · 6 cidades</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:opacity-90 transition-opacity">
          <Plus size={15} /> Adicionar unidade
        </button>
      </div>

      {units.map((unit, i) => (
        <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
          <button
            className="w-full flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <div className={`w-3 h-3 rounded-full shrink-0 ${unit.status === "online" ? "bg-[#22C55E]" : unit.status === "warning" ? "bg-[#FACC15]" : "bg-[#EF4444]"} ${unit.online > 0 ? "animate-pulse" : ""}`} />
            <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <Building2 size={16} className="text-[#2563EB]" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">{unit.name}</p>
              <p className="text-xs text-muted-foreground">{unit.city} · {unit.screens} telas · {unit.online} online</p>
            </div>
            <div className="hidden md:flex items-center gap-6 text-right shrink-0">
              <div>
                <p className="text-xs text-muted-foreground">Receita</p>
                <p className="font-bold text-foreground">{unit.revenue}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">SLA</p>
                <p className={`font-bold ${parseFloat(unit.sla) > 95 ? "text-[#22C55E]" : parseFloat(unit.sla) > 80 ? "text-[#FACC15]" : "text-[#EF4444]"}`}>{unit.sla}</p>
              </div>
              <StatusBadge status={unit.status} />
            </div>
            <ChevronDown size={16} className={`text-muted-foreground transition-transform ${expanded === i ? "rotate-180" : ""}`} />
          </button>

          {expanded === i && (
            <div className="border-t border-border p-4 bg-secondary/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {[
                  { label: "Telas online", value: `${unit.online}/${unit.screens}`, icon: Monitor },
                  { label: "SLA mensal", value: unit.sla, icon: TrendingUp },
                  { label: "Receita mês", value: unit.revenue, icon: DollarSign },
                  { label: "Tendência", value: unit.trend, icon: TrendingUp },
                ].map((stat, j) => (
                  <div key={j} className="bg-card border border-border rounded-lg p-3 text-center">
                    <stat.icon size={16} className="text-muted-foreground mx-auto mb-1" />
                    <p className="font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#2563EB] hover:opacity-90">Ver telas</button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2563EB] border border-[#2563EB] hover:bg-[#EFF6FF]">Ver campanhas</button>
                <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground border border-border hover:bg-secondary">Relatório</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CampanhasView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Campanhas da Rede</h2>
          <p className="text-sm text-muted-foreground">8 ativas · 2 pausadas · 1 agendada</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border hover:bg-secondary transition-colors text-muted-foreground">
            <Filter size={14} /> Filtrar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:opacity-90 transition-opacity">
            <Plus size={15} /> Criar campanha para rede
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {campaigns.map((c, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <Megaphone size={18} className="text-[#2563EB]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-foreground">{c.name}</h3>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{c.region} · Até {c.end}</p>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Progresso da campanha</span>
                    <span>{c.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${c.progress}%`, backgroundColor: c.status === "active" ? "#2563EB" : c.status === "paused" ? "#94A3B8" : "#E2E8F0" }}
                    />
                  </div>
                </div>
              </div>

              <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-mono font-bold text-foreground">{c.impressions}</p>
                  <p className="text-xs text-muted-foreground">impressões</p>
                </div>
                <p className="text-sm font-bold text-[#22C55E]">{c.budget}</p>
              </div>

              <div className="flex gap-1.5 shrink-0">
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  {c.status === "active" ? <Pause size={15} className="text-muted-foreground" /> : <Play size={15} className="text-muted-foreground" />}
                </button>
                <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <ChevronRight size={15} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TelasView() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Todas as Telas</h2>
          <p className="text-sm text-muted-foreground">24 telas · 20 online · 4 com problema</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#DCFCE7] text-[#15803D] text-sm font-medium">
            <Wifi size={14} /> 20 online
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FEE2E2] text-[#B91C1C] text-sm font-medium">
            <WifiOff size={14} /> 4 offline
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {screens.map((s, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.status === "online" ? "bg-[#22C55E] animate-pulse" : s.status === "warning" ? "bg-[#FACC15]" : "bg-[#EF4444]"}`} />
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <Monitor size={18} className="text-[#2563EB]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground text-sm">{s.id}</p>
                <span className="text-xs text-muted-foreground">·</span>
                <p className="text-xs text-muted-foreground truncate">{s.location}</p>
              </div>
              <p className="text-xs text-muted-foreground">{s.unit}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-medium text-foreground">Uptime {s.uptime}</p>
              <p className="text-xs text-muted-foreground">sync {s.lastSync}</p>
            </div>
            <StatusBadge status={s.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReceitaView() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-2xl p-7 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white, transparent)", transform: "translate(30%, -30%)" }} />
        <p className="text-sm opacity-80 mb-1">Receita total da rede — Junho 2026</p>
        <p className="text-5xl font-extrabold mb-1" style={{ fontFamily: "'Inter Tight', sans-serif" }}>R$ 12.400</p>
        <p className="text-sm opacity-70 flex items-center gap-2">
          <TrendingUp size={14} /> +18% em relação a maio · R$ 10.500
        </p>
        <div className="flex items-center gap-4 mt-5">
          <button className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-[#2563EB] hover:opacity-90 flex items-center gap-2">
            <Download size={14} /> Relatório mensal
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Evolução da receita da rede</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyRevenue}>
            <defs>
              <linearGradient key="biz-revenue-grad" id="biz-revenue-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={(v) => [`R$ ${v}`, "Receita"]} contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
            <Area key="area-valor" type="monotone" dataKey="valor" stroke="#2563EB" strokeWidth={2.5} fill="url(#biz-revenue-grad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4" style={{ fontFamily: "'Inter Tight', sans-serif" }}>Receita por unidade</h3>
        <div className="space-y-3">
          {units.map((u, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs text-muted-foreground w-28 truncate">{u.name.replace("Filial ", "")}</span>
              <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(parseInt(u.revenue.replace(/\D/g, "") || "0") / 3200) * 100}%`, backgroundColor: "#2563EB" }}
                />
              </div>
              <span className="text-sm font-bold text-foreground w-20 text-right">{u.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BusinessDashboard({ onBack }: BusinessDashboardProps) {
  const [activeNav, setActiveNav] = useState("overview");

  const renderContent = () => {
    switch (activeNav) {
      case "units": return <UnidadesView />;
      case "screens": return <TelasView />;
      case "campaigns": return <CampanhasView />;
      case "revenue": return <ReceitaView />;
      default: return <OverviewView />;
    }
  };

  const titles: Record<string, string> = {
    overview: "Overview", units: "Unidades", screens: "Telas",
    campaigns: "Campanhas", content: "Conteúdo", revenue: "Receita",
    reports: "Relatórios", alerts: "Alertas", settings: "Configurações",
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar items={navItems} activeItem={activeNav} onNavigate={setActiveNav} tier="business" onBack={onBack} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-bold text-foreground" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
              {titles[activeNav]} — Rede Café & Padarias
            </h1>
            <p className="text-xs text-muted-foreground">8 unidades · 24 telas · Sexta-feira, 07 de junho de 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444]" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#2563EB] hover:opacity-90 transition-opacity">
              <Plus size={16} /> Criar campanha
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
          {renderContent()}
        </main>
      </div>

      <MobileNav items={navItems} activeItem={activeNav} onNavigate={setActiveNav} accentColor="#2563EB" />
    </div>
  );
}
