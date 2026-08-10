import { useState } from "react";
import { ArrowLeft, Building2, Users, TrendingUp, DollarSign, Shield, Activity,
  CheckCircle2, BarChart2, Eye, FileText, Globe, Award } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const T = {
  bg: "#020617", card: "#0F172A", cardLight: "#1E293B",
  border: "rgba(255,255,255,0.08)", primary: "#2563EB", secondary: "#0EA5E9",
  success: "#22C55E", warning: "#F59E0B", purple: "#8B5CF6", gray: "#64748B",
  text: "#F1F5F9", textSub: "#94A3B8",
};

const clients = [
  { name: "Nike Brasil", campaigns: 8, impr: "12.4M", revenue: "R$298K", status: "Ativo", trust: 98.4, roi: "+41%" },
  { name: "Samsung Electronics", campaigns: 6, impr: "8.8M", revenue: "R$224K", status: "Ativo", trust: 97.8, roi: "+38%" },
  { name: "iFood", campaigns: 12, impr: "24.2M", revenue: "R$486K", status: "Ativo", trust: 97.2, roi: "+27%" },
  { name: "Vivo", campaigns: 4, impr: "5.6M", revenue: "R$142K", status: "Pausado", trust: 96.9, roi: "+19%" },
  { name: "Renner", campaigns: 7, impr: "9.1M", revenue: "R$214K", status: "Ativo", trust: 97.5, roi: "+33%" },
  { name: "Nubank", campaigns: 5, impr: "6.8M", revenue: "R$178K", status: "Ativo", trust: 98.1, roi: "+44%" },
];

const monthlyData = [
  { m: "Jan", clientA: 82, clientB: 61, clientC: 74 }, { m: "Fev", clientA: 91, clientB: 68, clientC: 82 },
  { m: "Mar", clientA: 87, clientB: 72, clientC: 79 }, { m: "Abr", clientA: 104, clientB: 84, clientC: 91 },
  { m: "Mai", clientA: 118, clientB: 92, clientC: 104 }, { m: "Jun", clientA: 134, clientB: 108, clientC: 118 },
];

const navItems = [
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "campanhas", label: "Campanhas", icon: Activity },
  { id: "inventario", label: "Inventário", icon: Globe },
  { id: "relatorios", label: "Relatórios", icon: FileText },
  { id: "auditoria", label: "Auditoria", icon: Shield },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
];

export default function AgencyCenter({ onBack }: { onBack: () => void }) {
  const [activeNav, setActiveNav] = useState("clientes");

  return (
    <div className="min-h-screen flex" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <aside className="w-56 flex-shrink-0 border-r flex flex-col" style={{ borderColor: T.border, background: T.card }}>
        <div className="p-5 border-b" style={{ borderColor: T.border }}>
          <button onClick={onBack} className="flex items-center gap-2 text-xs mb-4 hover:opacity-80" style={{ color: T.textSub }}>&larr; Voltar</button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: T.purple }}><Building2 size={16} color="#fff" /></div>
            <div>
              <div className="font-bold text-sm" style={{ color: T.text }}>Agency Center</div>
              <div className="text-xs" style={{ color: T.textSub }}>6 clientes ativos</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3">
          {navItems.map(n => (
            <button key={n.id} onClick={() => setActiveNav(n.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-all text-left" style={{ background: activeNav === n.id ? `${T.primary}18` : "transparent", color: activeNav === n.id ? T.primary : T.textSub, border: `1px solid ${activeNav === n.id ? T.primary + "30" : "transparent"}` }}>
              <n.icon size={16} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: T.border }}>
          <div className="p-3 rounded-xl" style={{ background: `${T.success}10`, border: `1px solid ${T.success}25` }}>
            <div className="text-xs font-semibold" style={{ color: T.success }}>Trust Score</div>
            <div className="text-2xl font-bold" style={{ color: T.success }}>97.3</div>
            <div className="text-xs" style={{ color: T.textSub }}>Média dos clientes</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: T.border }}>
          <div>
            <h1 className="font-bold text-xl" style={{ color: T.text }}>{navItems.find(n => n.id === activeNav)?.label}</h1>
            <p className="text-xs mt-0.5" style={{ color: T.textSub }}>Gestão centralizada de clientes e campanhas</p>
          </div>
          <div className="flex gap-3">
            {[{ l: "Clientes", v: "6", c: T.primary }, { l: "Campanhas", v: "42", c: T.secondary }, { l: "Impressões", v: "66.9M", c: T.success }, { l: "Receita", v: "R$1.54M", c: T.warning }].map((k, i) => (
              <div key={`agkpi-${i}`} className="text-center px-4 py-2 rounded-xl border" style={{ background: T.card, borderColor: `${k.c}25` }}>
                <div className="text-lg font-bold" style={{ color: k.c }}>{k.v}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{k.l}</div>
              </div>
            ))}
          </div>
        </header>

        <div className="flex-1 p-6">
          {activeNav === "clientes" && (
            <div className="rounded-2xl border overflow-hidden" style={{ background: T.card, borderColor: T.border }}>
              <div className="grid grid-cols-7 px-5 py-3 border-b text-xs font-semibold" style={{ borderColor: T.border, color: T.textSub }}>
                <span className="col-span-2">Cliente</span><span>Campanhas</span><span>Impressões</span><span>Receita</span><span>Status</span><span>Trust</span>
              </div>
              {clients.map((c, i) => (
                <div key={`agcl-${i}`} className="grid grid-cols-7 px-5 py-4 border-b last:border-b-0 hover:bg-white/3 transition-colors items-center" style={{ borderColor: T.border }}>
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm" style={{ background: `${T.primary}18`, color: T.primary }}>{c.name.slice(0, 2)}</div>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: T.text }}>{c.name}</div>
                      <div className="text-xs" style={{ color: T.success }}>ROI {c.roi}</div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: T.secondary }}>{c.campaigns}</span>
                  <span className="text-sm" style={{ color: T.primary }}>{c.impr}</span>
                  <span className="text-sm font-semibold" style={{ color: T.success }}>{c.revenue}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-full w-fit" style={{ background: c.status === "Ativo" ? `${T.success}18` : `${T.warning}18`, color: c.status === "Ativo" ? T.success : T.warning }}>{c.status}</span>
                  <div className="flex items-center gap-1.5"><span className="text-sm font-semibold" style={{ color: T.warning }}>{c.trust}</span><Award size={12} style={{ color: T.warning }} /></div>
                </div>
              ))}
            </div>
          )}

          {activeNav === "financeiro" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="text-sm font-semibold mb-4" style={{ color: T.text }}>Receita por Cliente (R$ K)</div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid key="agbcg" strokeDasharray="3 3" stroke={T.border} />
                    <XAxis key="agbx" dataKey="m" tick={{ fontSize: 10, fill: T.textSub }} stroke={T.border} />
                    <YAxis key="agby" tick={{ fontSize: 10, fill: T.textSub }} stroke={T.border} />
                    <Tooltip key="agbtt" contentStyle={{ background: T.cardLight, border: "none", borderRadius: 8, fontSize: 11, color: T.text }} />
                    <Bar key="agb1" dataKey="clientA" fill={T.primary} radius={[4, 4, 0, 0]} name="Nike" />
                    <Bar key="agb2" dataKey="clientB" fill={T.secondary} radius={[4, 4, 0, 0]} name="Samsung" />
                    <Bar key="agb3" dataKey="clientC" fill={T.success} radius={[4, 4, 0, 0]} name="iFood" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-4">
                {[{ l: "Investimento Total", v: "R$1.54M", sub: "+28% vs. mês anterior", c: T.primary }, { l: "Receita Gerada", v: "R$2.08M", sub: "+34% vs. mês anterior", c: T.success }, { l: "ROI Médio", v: "+35%", sub: "Acima do benchmark", c: T.warning }, { l: "Provas Auditadas", v: "4.8M", sub: "100% verificadas", c: T.purple }].map((f, i) => (
                  <div key={`agf-${i}`} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: `${f.c}25` }}>
                    <div className="text-xs" style={{ color: T.textSub }}>{f.l}</div>
                    <div className="text-2xl font-bold my-1" style={{ color: f.c }}>{f.v}</div>
                    <div className="text-xs" style={{ color: T.success }}>{f.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeNav === "campanhas" || activeNav === "inventario" || activeNav === "relatorios" || activeNav === "auditoria") && (
            <div className="flex items-center justify-center h-64 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="text-center"><div className="text-4xl mb-3">📊</div><div className="text-sm font-semibold" style={{ color: T.text }}>Módulo {navItems.find(n => n.id === activeNav)?.label}</div><div className="text-xs mt-1" style={{ color: T.textSub }}>Dados carregando em tempo real...</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
