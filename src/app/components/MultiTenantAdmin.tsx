import { useState } from "react";
import { ArrowLeft, Building2, Users, Monitor, DollarSign, Shield, Settings, Search, Plus, Eye, TrendingUp, CheckCircle, AlertTriangle, Crown, Globe, ChevronRight, BarChart2, Zap, X } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

interface Tenant {
  id: number; name: string; slug: string; plan: "starter" | "pro" | "enterprise";
  status: "active" | "suspended" | "trial";
  screens: number; users: number; mrr: number;
  city: string; segment: string;
  created: string; lastLogin: string;
  color: string; logo: string;
}

const TENANTS: Tenant[] = [
  { id: 1,  name: "Bar & Grill Network",   slug: "bargrill",  plan: "enterprise", status: "active",    screens: 24, users: 8,  mrr: 14880, city: "Sao Paulo",      segment: "Alimentacao", created: "Jan 2026", lastLogin: "Hoje",        color: T.primary,  logo: "B" },
  { id: 2,  name: "FitLife Academias",     slug: "fitlife",   plan: "pro",        status: "active",    screens: 12, users: 4,  mrr: 3480,  city: "Rio de Janeiro",  segment: "Fitness",     created: "Mar 2026", lastLogin: "Ontem",       color: T.success,  logo: "F" },
  { id: 3,  name: "Saude+ Clinicas",       slug: "saudeplus", plan: "enterprise", status: "active",    screens: 18, users: 6,  mrr: 11160, city: "Belo Horizonte",  segment: "Saude",       created: "Fev 2026", lastLogin: "Hoje",        color: T.accent,   logo: "S" },
  { id: 4,  name: "Kings Barbearia",       slug: "kings",     plan: "starter",    status: "active",    screens: 3,  users: 2,  mrr: 291,   city: "Curitiba",        segment: "Beleza",      created: "Mai 2026", lastLogin: "3 dias atras", color: T.warning, logo: "K" },
  { id: 5,  name: "FarmaRede",             slug: "farmarede", plan: "pro",        status: "active",    screens: 8,  users: 3,  mrr: 2320,  city: "Sao Paulo",       segment: "Farmacia",    created: "Abr 2026", lastLogin: "Hoje",        color: "#FF6B6B",  logo: "R" },
  { id: 6,  name: "Pets & CIA",            slug: "petcia",    plan: "starter",    status: "trial",     screens: 1,  users: 1,  mrr: 97,    city: "Florianopolis",   segment: "Pet",         created: "Jul 2026", lastLogin: "Hoje",        color: "#00D4AA",  logo: "P" },
  { id: 7,  name: "Varejo Express",        slug: "varejo",    plan: "pro",        status: "suspended", screens: 0,  users: 2,  mrr: 0,     city: "Porto Alegre",    segment: "Varejo",      created: "Jun 2026", lastLogin: "15 dias atras", color: T.danger, logo: "V" },
  { id: 8,  name: "EduTech Screens",       slug: "edutech",   plan: "enterprise", status: "active",    screens: 31, users: 12, mrr: 19220, city: "Sao Paulo",       segment: "Educacao",    created: "Dez 2025", lastLogin: "Hoje",        color: T.gold,     logo: "E" },
];

const PLAN_COLORS = { starter: T.textSub, pro: T.primary, enterprise: T.gold };
const STATUS_CFG = {
  active:    { label: "Ativo",     color: T.success },
  suspended: { label: "Suspenso",  color: T.danger },
  trial:     { label: "Trial",     color: T.warning },
};

const REVENUE_TREND = [
  { day: "D1", mrr: 48000 }, { day: "D2", mrr: 52200 }, { day: "D3", mrr: 49600 },
  { day: "D4", mrr: 56400 }, { day: "D5", mrr: 60800 }, { day: "D6", mrr: 57200 }, { day: "D7", mrr: 64400 },
];

const tooltipStyle = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text };

export default function MultiTenantAdmin({ onBack, onNavigate }: Props) {
  const [tenants, setTenants] = useState<Tenant[]>(TENANTS);
  const [selected, setSelected] = useState<Tenant | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"tenants" | "overview" | "billing">("overview");
  const [planFilter, setPlanFilter] = useState<"all" | Tenant["plan"]>("all");

  const filtered = tenants.filter(t =>
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.slug.includes(search.toLowerCase())) &&
    (planFilter === "all" || t.plan === planFilter)
  );

  const totalMRR     = tenants.reduce((a, t) => a + t.mrr, 0);
  const totalScreens = tenants.reduce((a, t) => a + t.screens, 0);
  const totalUsers   = tenants.reduce((a, t) => a + t.users, 0);
  const activeCount  = tenants.filter(t => t.status === "active").length;

  const suspend = (id: number) => setTenants(prev => prev.map(t => t.id === id ? { ...t, status: "suspended", mrr: 0 } : t));
  const activate = (id: number) => setTenants(prev => prev.map(t => t.id === id ? { ...t, status: "active" } : t));

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
                <Crown size={18} style={{ color: T.gold }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Super Admin</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Gestao multi-tenant DOOHPLAY</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 rounded-xl" style={{ background: T.danger + "15", border: `1px solid ${T.danger}30` }}>
            <Shield size={12} style={{ color: T.danger }} />
            <span className="text-xs font-bold" style={{ color: T.danger }}>Acesso Super Admin</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-0 flex gap-1">
          {(["overview","tenants","billing"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2.5 text-sm font-bold border-b-2 transition-all"
              style={{ color: tab === t ? T.primary : T.textSub, borderColor: tab === t ? T.primary : "transparent" }}>
              {t === "overview" ? "Visao Geral" : t === "tenants" ? `Tenants (${tenants.length})` : "Faturamento"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "MRR total", value: `R$${totalMRR.toLocaleString("pt-BR")}`, color: T.gold, icon: DollarSign },
            { label: "Tenants ativos", value: activeCount, color: T.success, icon: Building2 },
            { label: "Telas totais", value: totalScreens, color: T.primary, icon: Monitor },
            { label: "Usuarios cadastrados", value: totalUsers, color: T.accent, icon: Users },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border flex items-center gap-3" style={{ background: T.card, borderColor: T.border }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: k.color + "20" }}>
                <k.icon size={16} style={{ color: k.color }} />
              </div>
              <div>
                <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{k.label}</div>
              </div>
            </div>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">MRR total - ultimos 7 dias</h3>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={REVENUE_TREND}>
                  <defs>
                    <linearGradient id="mta-mrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.gold} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={T.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`R$${v.toLocaleString("pt-BR")}`, "MRR"]} />
                  <Area type="monotone" dataKey="mrr" stroke={T.gold} fill="url(#mta-mrr)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">MRR por plano</h3>
              <div className="space-y-3">
                {(["enterprise","pro","starter"] as const).map(plan => {
                  const planTenants = tenants.filter(t => t.plan === plan && t.status === "active");
                  const planMRR = planTenants.reduce((a, t) => a + t.mrr, 0);
                  return (
                    <div key={plan}>
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          <span className="capitalize font-medium">{plan}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: PLAN_COLORS[plan] + "20", color: PLAN_COLORS[plan] }}>{planTenants.length} tenants</span>
                        </div>
                        <span className="font-bold" style={{ color: PLAN_COLORS[plan] }}>R${planMRR.toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: T.panel }}>
                        <div className="h-full rounded-full" style={{ width: `${(planMRR / totalMRR) * 100}%`, background: PLAN_COLORS[plan] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="col-span-2 p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Top tenants por receita</h3>
              <div className="space-y-2">
                {[...tenants].sort((a,b) => b.mrr - a.mrr).map((t, i) => (
                  <div key={t.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: T.panel }}>
                    <span className="text-xs font-bold w-5 text-center" style={{ color: T.textSub }}>#{i+1}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: t.color + "20", color: t.color }}>{t.logo}</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{t.name}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{t.city} - {t.screens} telas - {t.users} usuarios</div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize" style={{ background: PLAN_COLORS[t.plan] + "20", color: PLAN_COLORS[t.plan] }}>{t.plan}</span>
                    <span className="font-black" style={{ color: T.gold }}>R${t.mrr.toLocaleString("pt-BR")}/mes</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "tenants" && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: T.card, border: `1px solid ${T.border}` }}>
                <Search size={14} style={{ color: T.textSub }} />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nome ou slug..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: T.text }} />
              </div>
              {(["all","starter","pro","enterprise"] as const).map(p => (
                <button key={p} onClick={() => setPlanFilter(p)}
                  className="px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all"
                  style={{ background: planFilter === p ? T.primary + "20" : T.card, color: planFilter === p ? T.primary : T.textSub, border: `1px solid ${planFilter === p ? T.primary + "40" : T.border}` }}>
                  {p === "all" ? "Todos" : p}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: T.card, borderBottom: `1px solid ${T.border}` }}>
                    {["Tenant", "Plano", "Status", "Telas", "MRR", "Cidade", "Ultimo login", "Acoes"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold" style={{ color: T.textSub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, i) => {
                    const sc = STATUS_CFG[t.status];
                    return (
                      <tr key={t.id}
                        className="cursor-pointer hover:bg-white/2 transition-colors"
                        style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : "none" }}
                        onClick={() => setSelected(selected?.id === t.id ? null : t)}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs"
                              style={{ background: t.color + "20", color: t.color }}>{t.logo}</div>
                            <div>
                              <div className="font-medium text-sm">{t.name}</div>
                              <div className="text-xs" style={{ color: T.textSub }}>{t.slug}.doohplay.com</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold capitalize"
                            style={{ background: PLAN_COLORS[t.plan] + "20", color: PLAN_COLORS[t.plan] }}>{t.plan}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold" style={{ color: sc.color }}>{sc.label}</span>
                        </td>
                        <td className="px-4 py-3 text-sm">{t.screens}</td>
                        <td className="px-4 py-3 font-bold text-sm" style={{ color: T.gold }}>
                          {t.mrr > 0 ? `R$${t.mrr.toLocaleString("pt-BR")}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: T.textSub }}>{t.city}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: T.textSub }}>{t.lastLogin}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {t.status === "active" && (
                              <button onClick={e => { e.stopPropagation(); suspend(t.id); }}
                                className="px-2 py-1 rounded-lg text-xs font-bold"
                                style={{ background: T.danger + "15", color: T.danger }}>Suspender</button>
                            )}
                            {t.status === "suspended" && (
                              <button onClick={e => { e.stopPropagation(); activate(t.id); }}
                                className="px-2 py-1 rounded-lg text-xs font-bold"
                                style={{ background: T.success + "15", color: T.success }}>Ativar</button>
                            )}
                            <button className="p-1 rounded-lg hover:bg-white/5"><Eye size={13} style={{ color: T.textSub }} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {selected && (
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: selected.color + "40" }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black" style={{ background: selected.color + "20", color: selected.color }}>{selected.logo}</div>
                    <div>
                      <h3 className="font-black text-lg">{selected.name}</h3>
                      <p className="text-xs" style={{ color: T.textSub }}>{selected.slug}.doohplay.com - Criado em {selected.created}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)}><X size={16} style={{ color: T.textSub }} /></button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Plano", value: selected.plan, color: PLAN_COLORS[selected.plan] },
                    { label: "MRR", value: `R$${selected.mrr.toLocaleString("pt-BR")}`, color: T.gold },
                    { label: "Telas", value: selected.screens, color: T.primary },
                    { label: "Usuarios", value: selected.users, color: T.accent },
                  ].map((m, i) => (
                    <div key={i} className="p-3 rounded-xl text-center" style={{ background: T.panel }}>
                      <div className="font-black text-xl mb-1 capitalize" style={{ color: m.color }}>{m.value}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "billing" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "ARR projetado", value: `R$${(totalMRR * 12).toLocaleString("pt-BR")}`, color: T.gold },
                { label: "Ticket medio", value: `R$${Math.round(totalMRR / activeCount).toLocaleString("pt-BR")}/mes`, color: T.primary },
                { label: "Churn rate", value: "2.8%", color: T.success },
              ].map((m, i) => (
                <div key={i} className="p-5 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-black text-3xl mb-1" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-sm" style={{ color: T.textSub }}>{m.label}</div>
                </div>
              ))}
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Receita por tenant este mes</h3>
              <div className="space-y-2">
                {[...tenants].sort((a,b) => b.mrr - a.mrr).filter(t => t.mrr > 0).map(t => {
                  const pct = (t.mrr / totalMRR) * 100;
                  return (
                    <div key={t.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t.name}</span>
                        <span className="font-bold" style={{ color: T.gold }}>R${t.mrr.toLocaleString("pt-BR")} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.panel }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: t.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
