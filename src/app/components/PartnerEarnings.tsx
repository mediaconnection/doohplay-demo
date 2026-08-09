import { useState } from "react";
import { ArrowLeft, TrendingUp, DollarSign, Users, Star, ChevronDown, Download, Filter, Award, Zap, ArrowUpRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const earningsHistory = MONTHS.map((m, i) => ({
  month: m,
  gross: 800 + i * 220 + Math.random() * 300,
  net: 600 + i * 180 + Math.random() * 250,
  refs: 2 + Math.floor(i * 0.8),
}));

const PARTNERS = [
  { name: "Carlos Mendes", city: "São Paulo", tier: "Gold", screens: 18, mrr: 3420, commission: 684, refs: 12, status: "active", joinDate: "Jan 2025", growth: 28 },
  { name: "Aline Ferreira", city: "Rio de Janeiro", tier: "Silver", screens: 9, mrr: 1890, commission: 284, refs: 7, status: "active", joinDate: "Mar 2025", growth: 15 },
  { name: "Roberto Lima", city: "Belo Horizonte", tier: "Bronze", screens: 4, mrr: 890, commission: 89, refs: 3, status: "active", joinDate: "Abr 2025", growth: 8 },
  { name: "Fernanda Castro", city: "Curitiba", tier: "Gold", screens: 22, mrr: 4180, commission: 836, refs: 19, status: "active", joinDate: "Fev 2025", growth: 42 },
  { name: "Paulo Teixeira", city: "Brasília", tier: "Silver", screens: 11, mrr: 2310, commission: 347, refs: 8, status: "pending", joinDate: "Mai 2025", growth: 11 },
  { name: "Lucia Nunes", city: "Salvador", tier: "Bronze", screens: 6, mrr: 1260, commission: 126, refs: 5, status: "active", joinDate: "Jun 2025", growth: 5 },
  { name: "Diego Santos", city: "Porto Alegre", tier: "Platinum", screens: 35, mrr: 7350, commission: 1838, refs: 28, status: "active", joinDate: "Dez 2024", growth: 67 },
  { name: "Mariana Pires", city: "Recife", tier: "Silver", screens: 8, mrr: 1680, commission: 252, refs: 6, status: "active", joinDate: "Abr 2025", growth: 19 },
];

const TIER_COLORS: Record<string, string> = {
  Bronze: "#CD7F32", Silver: "#A8A9AD", Gold: T.gold, Platinum: T.accent,
};
const TIER_COMMISSION: Record<string, number> = {
  Bronze: 10, Silver: 15, Gold: 20, Platinum: 25,
};

const COMMISSION_BY_TIER = [
  { tier: "Bronze", commission: 10, count: 3 },
  { tier: "Silver", commission: 15, count: 3 },
  { tier: "Gold", commission: 20, count: 2 },
  { tier: "Platinum", commission: 25, count: 1 },
];

const PENDING_PAYOUTS = [
  { id: "PAY-2024", partner: "Diego Santos", amount: 1838, method: "PIX", due: "01/08/2026" },
  { id: "PAY-2023", partner: "Fernanda Castro", amount: 836, method: "PIX", due: "01/08/2026" },
  { id: "PAY-2022", partner: "Carlos Mendes", amount: 684, method: "TED", due: "01/08/2026" },
  { id: "PAY-2021", partner: "Paulo Teixeira", amount: 347, method: "PIX", due: "01/08/2026" },
];

export default function PartnerEarnings({ onBack, onNavigate }: Props) {
  const [period, setPeriod]   = useState("2026");
  const [sortBy, setSortBy]   = useState<"mrr" | "commission" | "screens" | "growth">("commission");
  const [filter, setFilter]   = useState("Todos");

  const sorted = [...PARTNERS]
    .filter(p => filter === "Todos" || p.tier === filter)
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const totalMRR        = PARTNERS.reduce((s, p) => s + p.mrr, 0);
  const totalCommission = PARTNERS.reduce((s, p) => s + p.commission, 0);
  const totalPartners   = PARTNERS.length;
  const totalScreens    = PARTNERS.reduce((s, p) => s + p.screens, 0);
  const pendingTotal    = PENDING_PAYOUTS.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5">
              <ArrowLeft size={18} style={{ color: T.textSub }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
                <Award size={18} style={{ color: T.gold }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Parceiros & Comissões</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Programa de afiliados DOOHPLAY</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {["2024","2025","2026"].map(y => (
              <button key={y} onClick={() => setPeriod(y)}
                className="px-3 py-1.5 rounded-lg text-sm font-bold"
                style={{ background: period === y ? T.gold + "20" : "transparent", color: period === y ? T.gold : T.textSub, border: `1px solid ${period === y ? T.gold + "40" : "transparent"}` }}>
                {y}
              </button>
            ))}
            <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold ml-2"
              style={{ background: T.card, color: T.textSub, border: `1px solid ${T.border}` }}>
              <Download size={13} /> Exportar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: "MRR Total Parceiros", value: `R$${(totalMRR/1000).toFixed(1)}k`, sub: "+18% vs mês ant.", color: T.success, icon: TrendingUp },
            { label: "Comissões a Pagar", value: `R$${(pendingTotal).toLocaleString("pt-BR")}`, sub: `${PENDING_PAYOUTS.length} pendentes`, color: T.warning, icon: DollarSign },
            { label: "Total Parceiros", value: totalPartners, sub: "+2 este mês", color: T.primary, icon: Users },
            { label: "Telas Gerenciadas", value: totalScreens, sub: "em 8 cidades", color: T.accent, icon: Zap },
            { label: "Comissão Média", value: "18%", sub: "tier weighted avg", color: T.gold, icon: Star },
          ].map((k, i) => (
            <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: k.color + "20" }}>
                  <k.icon size={15} style={{ color: k.color }} />
                </div>
                <ArrowUpRight size={13} style={{ color: T.success }} />
              </div>
              <div className="font-black text-2xl" style={{ color: k.color }}>{k.value}</div>
              <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{k.label}</div>
              <div className="text-xs mt-1" style={{ color: T.success }}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black">Evolução de Comissões</h3>
                <p className="text-xs mt-0.5" style={{ color: T.textSub }}>Gross vs. Net {period}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={earningsHistory}>
                <defs>
                  <linearGradient key="grad-gross" id="grad-gross" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.gold} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={T.gold} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient key="grad-net" id="grad-net" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={T.success} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={T.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} />
                <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12 }} formatter={(v: number) => [`R$${v.toFixed(0)}`, ""]} />
                <Area key="area-gross" type="monotone" dataKey="gross" stroke={T.gold} fill="url(#grad-gross)" strokeWidth={2} />
                <Area key="area-net" type="monotone" dataKey="net" stroke={T.success} fill="url(#grad-net)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
            <h3 className="font-black mb-1">Comissão por Tier</h3>
            <p className="text-xs mb-4" style={{ color: T.textSub }}>% de comissão por nível</p>
            <div className="space-y-3">
              {COMMISSION_BY_TIER.map(tier => (
                <div key={tier.tier}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Star size={12} style={{ color: TIER_COLORS[tier.tier] }} />
                      <span className="text-sm font-bold" style={{ color: TIER_COLORS[tier.tier] }}>{tier.tier}</span>
                    </div>
                    <div className="text-xs" style={{ color: T.textSub }}>{tier.count} parceiros · {tier.commission}%</div>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: T.border }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${tier.commission * 4}%`, background: TIER_COLORS[tier.tier] }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-xl" style={{ background: T.panel }}>
              <div className="text-xs font-bold mb-1" style={{ color: T.gold }}>Próxima Promoção</div>
              <div className="text-xs" style={{ color: T.textSub }}>3 parceiros elegíveis para upgrade de tier este mês</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.warning + "20" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-black">Pagamentos Pendentes</h3>
              <p className="text-xs" style={{ color: T.textSub }}>Total: R${pendingTotal.toLocaleString("pt-BR")} · Vencimento 01/08/2026</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
              style={{ background: T.success, color: "#000" }}>
              Pagar Todos via PIX
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {PENDING_PAYOUTS.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: T.panel, border: `1px solid ${T.border}` }}>
                <div>
                  <div className="text-xs font-bold">{p.partner}</div>
                  <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{p.id} · {p.method}</div>
                </div>
                <div className="text-right">
                  <div className="font-black" style={{ color: T.gold }}>R${p.amount.toLocaleString("pt-BR")}</div>
                  <div className="text-xs" style={{ color: T.textSub }}>{p.due}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black">Todos os Parceiros</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {["Todos", "Platinum", "Gold", "Silver", "Bronze"].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: filter === f ? (TIER_COLORS[f] || T.primary) + "25" : "transparent", color: filter === f ? (TIER_COLORS[f] || T.primary) : T.textSub }}>
                    {f}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 ml-2 text-xs" style={{ color: T.textSub }}>
                Ordenar:
                {(["commission","mrr","screens","growth"] as const).map(s => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className="px-2 py-1 rounded text-xs"
                    style={{ background: sortBy === s ? T.primary + "20" : "transparent", color: sortBy === s ? T.primary : T.textSub }}>
                    {s === "commission" ? "Comissão" : s === "mrr" ? "MRR" : s === "screens" ? "Telas" : "Crescimento"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ borderBottom: `1px solid ${T.border}` }}>
                  {["Parceiro","Tier","Telas","MRR","Comissão","Refs","Crescimento","Status"].map(h => (
                    <th key={h} className="pb-2 pr-4 font-bold text-xs" style={{ color: T.textSub }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => (
                  <tr key={i} className="border-b hover:bg-white/3 transition-colors" style={{ borderColor: T.border + "60" }}>
                    <td className="py-3 pr-4">
                      <div className="font-bold">{p.name}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{p.city} · desde {p.joinDate}</div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: TIER_COLORS[p.tier] + "20", color: TIER_COLORS[p.tier] }}>
                        {p.tier}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-bold">{p.screens}</td>
                    <td className="py-3 pr-4 font-bold">R${p.mrr.toLocaleString("pt-BR")}</td>
                    <td className="py-3 pr-4">
                      <div className="font-black" style={{ color: T.gold }}>R${p.commission.toLocaleString("pt-BR")}</div>
                      <div className="text-xs" style={{ color: T.textSub }}>{TIER_COMMISSION[p.tier]}% do MRR</div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1">
                        <Users size={12} style={{ color: T.accent }} />
                        <span className="font-bold">{p.refs}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <div className="h-1.5 rounded-full flex-1 max-w-16" style={{ background: T.border }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, p.growth * 1.5)}%`, background: T.success }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: T.success }}>+{p.growth}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: p.status === "active" ? T.success + "20" : T.warning + "20", color: p.status === "active" ? T.success : T.warning }}>
                        {p.status === "active" ? "Ativo" : "Pendente"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
