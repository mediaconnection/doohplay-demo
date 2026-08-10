import { useState } from "react";
import {
  ArrowLeft, Crown, Store, Users, Palette, Globe, Copy, CheckCircle,
  TrendingUp, DollarSign, Plus, Settings, Eye, Trash2, X, Upload,
  BarChart2, Zap, Shield, ChevronRight, RefreshCw, Link2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

type ResellerStatus = "active" | "pending" | "suspended";
type ResellerPlan = "starter" | "growth" | "enterprise";

interface Reseller {
  id: string;
  brand: string;
  domain: string;
  contact: string;
  plan: ResellerPlan;
  status: ResellerStatus;
  clients: number;
  mrr: number;
  commission: number;
  primaryColor: string;
  logoUrl?: string;
  joinedAt: string;
}

const PLAN_META: Record<ResellerPlan, { label: string; color: string; limit: string }> = {
  starter:    { label: "Starter",    color: T.primary, limit: "até 20 clientes" },
  growth:     { label: "Growth",     color: T.accent,  limit: "até 100 clientes" },
  enterprise: { label: "Enterprise", color: T.gold,    limit: "ilimitado" },
};

const STATUS_META: Record<ResellerStatus, { label: string; color: string }> = {
  active:    { label: "Ativo",      color: T.success },
  pending:   { label: "Pendente",   color: T.warning },
  suspended: { label: "Suspenso",   color: T.danger  },
};

const RESELLERS: Reseller[] = [
  { id: "RS1", brand: "MediaHub São Paulo",   domain: "mediahub.com.br",    contact: "carlos@mediahub.com.br",   plan: "enterprise", status: "active",    clients: 42, mrr: 26040, commission: 20, primaryColor: "#E63946", joinedAt: "Jan 2025" },
  { id: "RS2", brand: "OOH Nordeste",         domain: "oohnordeste.com.br", contact: "fernanda@oohnordeste.br",  plan: "growth",     status: "active",    clients: 28, mrr: 8120,  commission: 15, primaryColor: "#F4A261", joinedAt: "Mar 2025" },
  { id: "RS3", brand: "Tela Digital Sul",     domain: "telasul.com.br",     contact: "rodrigo@telasul.com.br",   plan: "growth",     status: "active",    clients: 17, mrr: 4930,  commission: 15, primaryColor: "#2A9D8F", joinedAt: "May 2025" },
  { id: "RS4", brand: "AdScreen Brasília",    domain: "adscreen.com.br",    contact: "julia@adscreen.com.br",    plan: "starter",    status: "active",    clients: 8,  mrr: 2320,  commission: 10, primaryColor: "#457B9D", joinedAt: "Jun 2025" },
  { id: "RS5", brand: "Minas OOH",            domain: "minasooh.com.br",    contact: "pedro@minasooh.com.br",    plan: "starter",    status: "pending",   clients: 0,  mrr: 0,     commission: 10, primaryColor: "#6A4C93", joinedAt: "Jul 2025" },
  { id: "RS6", brand: "Pixel Outdoor",        domain: "pixelout.com.br",    contact: "amanda@pixelout.com.br",   plan: "growth",     status: "suspended", clients: 11, mrr: 0,     commission: 15, primaryColor: "#E9C46A", joinedAt: "Feb 2025" },
];

const MRR_TREND = Array.from({ length: 6 }, (_, i) => ({
  month: ["Fev","Mar","Abr","Mai","Jun","Jul"][i],
  mrr: [18000, 24000, 29000, 33000, 37000, 41410][i],
  resellers: [3, 4, 4, 5, 5, 6][i],
}));

const PLAN_DIST = [
  { plan: "Enterprise", count: 1, color: T.gold   },
  { plan: "Growth",     count: 3, color: T.accent  },
  { plan: "Starter",    count: 2, color: T.primary },
];

export default function WhiteLabelAdmin({ onBack, onNavigate }: Props) {
  const [tab, setTab]           = useState<"resellers" | "brand" | "analytics">("resellers");
  const [selected, setSelected] = useState<Reseller | null>(null);
  const [showNew, setShowNew]   = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newPlan, setNewPlan]   = useState<ResellerPlan>("starter");
  const [copied, setCopied]     = useState(false);

  const totalMRR      = RESELLERS.filter(r => r.status === "active").reduce((s, r) => s + r.mrr, 0);
  const totalClients  = RESELLERS.filter(r => r.status === "active").reduce((s, r) => s + r.clients, 0);
  const activeCount   = RESELLERS.filter(r => r.status === "active").length;
  const totalCommission = RESELLERS.filter(r => r.status === "active").reduce((s, r) => s + r.mrr * r.commission / 100, 0);

  function addReseller() {
    if (!newBrand || !newDomain) return;
    setShowNew(false);
    setNewBrand("");
    setNewDomain("");
  }

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
                <Crown size={18} style={{ color: T.gold }} />
              </div>
              <div>
                <h1 className="font-black text-lg">White Label Admin</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Gerencie revendedores e personalizações de marca</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {(["resellers","brand","analytics"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: tab === t ? T.gold + "20" : "transparent", color: tab === t ? T.gold : T.textSub, border: `1px solid ${tab === t ? T.gold + "30" : "transparent"}` }}>
                {t === "resellers" ? "Revendedores" : t === "brand" ? "Marca" : "Analytics"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Revendedores Ativos", value: activeCount,                                            color: T.gold,    icon: Store },
            { label: "MRR Revendas",        value: `R$${(totalMRR / 1000).toFixed(0)}k`,                  color: T.success, icon: DollarSign },
            { label: "Clientes das Revendas",value: totalClients,                                          color: T.primary, icon: Users },
            { label: "Comissões a Pagar",   value: `R$${totalCommission.toLocaleString("pt-BR",{minimumFractionDigits:0})}`, color: T.accent,  icon: TrendingUp },
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

        {tab === "resellers" && (
          <div className="flex gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black">Revendedores White Label</h2>
                <button onClick={() => setShowNew(!showNew)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
                  style={{ background: T.gold, color: "#000" }}>
                  <Plus size={14} /> Convidar Revendedor
                </button>
              </div>

              {showNew && (
                <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.gold + "40" }}>
                  <h3 className="font-black mb-4 text-sm">Novo Revendedor</h3>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>NOME DA MARCA</label>
                      <input value={newBrand} onChange={e => setNewBrand(e.target.value)}
                        placeholder="Ex: OOH Nordeste"
                        className="w-full px-3 py-2.5 rounded-xl text-sm"
                        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>DOMÍNIO</label>
                      <input value={newDomain} onChange={e => setNewDomain(e.target.value)}
                        placeholder="marca.com.br"
                        className="w-full px-3 py-2.5 rounded-xl text-sm"
                        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1.5 block" style={{ color: T.textSub }}>PLANO</label>
                      <select value={newPlan} onChange={e => setNewPlan(e.target.value as ResellerPlan)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm"
                        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }}>
                        <option value="starter">Starter — até 20 clientes</option>
                        <option value="growth">Growth — até 100 clientes</option>
                        <option value="enterprise">Enterprise — ilimitado</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addReseller} className="px-5 py-2 rounded-xl text-sm font-black" style={{ background: T.gold, color: "#000" }}>Enviar Convite</button>
                    <button onClick={() => setShowNew(false)} className="px-5 py-2 rounded-xl text-sm font-bold" style={{ background: T.border, color: T.textSub }}>Cancelar</button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {RESELLERS.map(rs => {
                  const pm = PLAN_META[rs.plan];
                  const sm = STATUS_META[rs.status];
                  return (
                    <div key={rs.id} onClick={() => setSelected(selected?.id === rs.id ? null : rs)}
                      className="p-4 rounded-2xl border cursor-pointer hover:bg-white/3 transition-all"
                      style={{ background: T.card, borderColor: selected?.id === rs.id ? T.gold + "60" : T.border }}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: rs.primaryColor + "20", border: `2px solid ${rs.primaryColor}30` }}>
                          <span className="font-black text-lg" style={{ color: rs.primaryColor }}>{rs.brand.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black">{rs.brand}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: pm.color + "20", color: pm.color }}>{pm.label}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: sm.color + "20", color: sm.color }}>{sm.label}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: T.textSub }}>
                            <span>{rs.domain}</span>
                            <span>·</span>
                            <span>{rs.contact}</span>
                            <span>·</span>
                            <span>desde {rs.joinedAt}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-5 text-right">
                          <div>
                            <div className="font-black">{rs.clients}</div>
                            <div className="text-xs" style={{ color: T.textSub }}>clientes</div>
                          </div>
                          <div>
                            <div className="font-black" style={{ color: rs.status === "active" ? T.success : T.textSub }}>
                              {rs.mrr > 0 ? `R$${(rs.mrr / 1000).toFixed(1)}k` : "—"}
                            </div>
                            <div className="text-xs" style={{ color: T.textSub }}>MRR</div>
                          </div>
                          <div>
                            <div className="font-black" style={{ color: T.gold }}>{rs.commission}%</div>
                            <div className="text-xs" style={{ color: T.textSub }}>comissão</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selected && (
              <div className="w-64 flex-shrink-0 p-5 rounded-2xl border space-y-4" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: T.textSub }}>{selected.id}</span>
                  <button onClick={() => setSelected(null)}><X size={13} style={{ color: T.textSub }} /></button>
                </div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                  style={{ background: selected.primaryColor + "20", border: `2px solid ${selected.primaryColor}40` }}>
                  <span className="font-black text-2xl" style={{ color: selected.primaryColor }}>{selected.brand.charAt(0)}</span>
                </div>
                <div className="text-center">
                  <div className="font-black">{selected.brand}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{selected.domain}</div>
                </div>
                {[
                  { label: "Plano",      value: PLAN_META[selected.plan].label,      color: PLAN_META[selected.plan].color },
                  { label: "Status",     value: STATUS_META[selected.status].label,  color: STATUS_META[selected.status].color },
                  { label: "Clientes",   value: `${selected.clients}` },
                  { label: "MRR",        value: selected.mrr > 0 ? `R$${selected.mrr.toLocaleString("pt-BR")}` : "—", color: T.success },
                  { label: "Comissão",   value: `${selected.commission}%`,           color: T.gold },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span style={{ color: T.textSub }}>{r.label}</span>
                    <span className="font-bold" style={{ color: (r as any).color || T.text }}>{r.value}</span>
                  </div>
                ))}
                <div className="space-y-2 pt-2">
                  <button className="w-full py-2 rounded-xl text-xs font-black" style={{ background: T.gold, color: "#000" }}>
                    Acessar Painel
                  </button>
                  <button className="w-full py-2 rounded-xl text-xs font-bold" style={{ background: T.primary + "20", color: T.primary, border: `1px solid ${T.primary}30` }}>
                    Editar Configurações
                  </button>
                  {selected.status === "pending" && (
                    <button className="w-full py-2 rounded-xl text-xs font-bold" style={{ background: T.success + "20", color: T.success, border: `1px solid ${T.success}30` }}>
                      Aprovar Revendedor
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "brand" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Identidade Visual Padrão</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold mb-2 block" style={{ color: T.textSub }}>NOME DA PLATAFORMA</label>
                    <input defaultValue="DOOHPLAY" className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-2 block" style={{ color: T.textSub }}>COR PRIMÁRIA</label>
                    <div className="flex items-center gap-3">
                      <input type="color" defaultValue="#4F6EF7"
                        className="w-12 h-10 rounded-xl cursor-pointer"
                        style={{ background: T.panel, border: `1px solid ${T.border}` }} />
                      <input defaultValue="#4F6EF7" className="flex-1 px-3 py-2.5 rounded-xl text-sm font-mono"
                        style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-2 block" style={{ color: T.textSub }}>DOMÍNIO BASE</label>
                    <input defaultValue="app.doohplay.com.br" className="w-full px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: T.panel, border: `1px solid ${T.border}`, color: T.text }} />
                  </div>
                  <div>
                    <label className="text-xs font-bold mb-2 block" style={{ color: T.textSub }}>LOGOTIPO</label>
                    <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-white/3"
                      style={{ borderColor: T.border }}>
                      <Upload size={20} className="mx-auto mb-2" style={{ color: T.textSub }} />
                      <span className="text-xs" style={{ color: T.textSub }}>Arraste ou clique para enviar</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-3">Permissões dos Revendedores</h3>
                <div className="space-y-2">
                  {[
                    { perm: "Personalizar marca própria",      on: true },
                    { perm: "Usar domínio customizado",        on: true },
                    { perm: "Criar campanhas ilimitadas",      on: false },
                    { perm: "Acessar relatórios avançados",    on: true },
                    { perm: "Habilitar integração Supabase",   on: false },
                    { perm: "Exportar dados dos clientes",     on: true },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: T.border + "60" }}>
                      <span className="text-sm">{p.perm}</span>
                      <div className="relative w-9 h-5 rounded-full" style={{ background: p.on ? T.success : T.border }}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: p.on ? "calc(100% - 18px)" : "2px" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">Preview — Painel do Revendedor</h3>
                <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${T.border}` }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ background: "#1A1A2E" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg" style={{ background: T.primary }} />
                      <span className="font-black text-sm">MediaHub SP</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ background: T.border }} />
                      <div className="w-4 h-4 rounded-full" style={{ background: T.border }} />
                    </div>
                  </div>
                  <div className="p-4 space-y-2" style={{ background: "#0D0D1A" }}>
                    <div className="grid grid-cols-3 gap-2">
                      {[T.success, T.primary, T.gold].map((c, i) => (
                        <div key={i} className="p-3 rounded-xl" style={{ background: c + "10" }}>
                          <div className="h-2 w-10 rounded mb-1" style={{ background: c + "60" }} />
                          <div className="h-5 w-14 rounded font-black" style={{ background: c + "40" }} />
                        </div>
                      ))}
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: T.border + "30" }}>
                      <div className="h-2 w-20 rounded mb-2" style={{ background: T.textSub + "40" }} />
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-2 rounded mb-1.5" style={{ background: T.textSub + "20", width: `${80 - i * 15}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-xl flex items-center gap-2" style={{ background: T.panel }}>
                  <Link2 size={12} style={{ color: T.textSub }} />
                  <span className="text-xs font-mono flex-1" style={{ color: T.textSub }}>mediahub.com.br/dashboard</span>
                  <CheckCircle size={12} style={{ color: T.success }} />
                </div>
              </div>

              <div className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="text-xs font-bold mb-2" style={{ color: T.textSub }}>SUBDOMÍNIOS ATIVOS</div>
                <div className="space-y-1.5">
                  {RESELLERS.filter(r => r.status === "active").slice(0, 4).map(rs => (
                    <div key={rs.id} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ background: rs.primaryColor }} />
                      <span className="font-mono" style={{ color: T.textSub }}>{rs.domain}</span>
                      <CheckCircle size={10} className="ml-auto" style={{ color: T.success }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-1">MRR Revendas — 6 meses</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Receita mensal recorrente dos revendedores</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={MRR_TREND}>
                    <defs>
                      <linearGradient key="grad-mrr" id="grad-mrr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={T.gold} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={T.gold} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [`R$${(v/1000).toFixed(0)}k`, "MRR"]} />
                    <Area type="monotone" dataKey="mrr" stroke={T.gold} fill="url(#grad-mrr)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-black mb-4">MRR por Revendedor</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={RESELLERS.filter(r => r.mrr > 0)} layout="vertical" barSize={14}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="brand" tick={{ fill: T.textSub, fontSize: 10 }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10 }}
                      formatter={(v: number) => [`R$${v.toLocaleString("pt-BR")}`, "MRR"]} />
                    <Bar dataKey="mrr" radius={[0, 6, 6, 0]}>
                      {RESELLERS.filter(r => r.mrr > 0).map((r, i) => (
                        <Cell key={`cell-r-${i}`} fill={r.primaryColor + "CC"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {PLAN_DIST.map((p, i) => (
                <div key={i} className="p-5 rounded-2xl border text-center" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-black text-3xl mb-1" style={{ color: p.color }}>{p.count}</div>
                  <div className="font-bold text-sm" style={{ color: p.color }}>{p.plan}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{PLAN_META[p.plan.toLowerCase() as ResellerPlan].limit}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
