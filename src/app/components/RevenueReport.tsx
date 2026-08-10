import { useState } from "react";
import { ArrowLeft, DollarSign, TrendingUp, TrendingDown, Download, Filter, Calendar, BarChart2, FileText, CheckCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

interface Props { onBack: () => void; onNavigate?: (v: string) => void; }

const MONTHLY_DATA = [
  { month: "Jan", receita: 4200, custos: 1200, lucro: 3000, impressoes: 180000 },
  { month: "Fev", receita: 5100, custos: 1350, lucro: 3750, impressoes: 215000 },
  { month: "Mar", receita: 4800, custos: 1280, lucro: 3520, impressoes: 202000 },
  { month: "Abr", receita: 6300, custos: 1600, lucro: 4700, impressoes: 268000 },
  { month: "Mai", receita: 7200, custos: 1820, lucro: 5380, impressoes: 305000 },
  { month: "Jun", receita: 8100, custos: 1950, lucro: 6150, impressoes: 342000 },
  { month: "Jul", receita: 9400, custos: 2100, lucro: 7300, impressoes: 398000 },
];

const REVENUE_STREAMS = [
  { name: "Publicidade Direta", value: 45, color: T.primary },
  { name: "Rede Programática", value: 28, color: T.accent },
  { name: "Patrocínio Local", value: 15, color: T.success },
  { name: "Conteúdo Premium", value: 8, color: T.warning },
  { name: "Outros", value: 4, color: T.textSub },
];

const TRANSACTIONS = [
  { id: "TXN-2026-0714", date: "14/07/2026", description: "Campanha Verão — Bar & Grill SP", value: 1280, type: "credit", status: "paid" },
  { id: "TXN-2026-0713", date: "13/07/2026", description: "Promoção Julho — Farmácia Saúde", value: 840, type: "credit", status: "paid" },
  { id: "TXN-2026-0712", date: "12/07/2026", description: "Plano Pro — assinatura mensal", value: -290, type: "debit", status: "paid" },
  { id: "TXN-2026-0711", date: "11/07/2026", description: "Flash Sale — Academia Fit", value: 520, type: "credit", status: "pending" },
  { id: "TXN-2026-0710", date: "10/07/2026", description: "Repasse rede programática", value: 730, type: "credit", status: "paid" },
  { id: "TXN-2026-0709", date: "09/07/2026", description: "Patrocínio mensal — Evento Tech", value: 1500, type: "credit", status: "paid" },
  { id: "TXN-2026-0708", date: "08/07/2026", description: "Taxa de processamento", value: -48, type: "debit", status: "paid" },
  { id: "TXN-2026-0707", date: "07/07/2026", description: "Institucional — Clínica Norte", value: 960, type: "credit", status: "paid" },
];

const PERIODS = ["Este mês", "Mês anterior", "Últimos 3 meses", "Últimos 6 meses", "Este ano"];

const tooltipStyle = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text };

export default function RevenueReport({ onBack, onNavigate }: Props) {
  const [period, setPeriod] = useState("Este mês");
  const [tab, setTab] = useState<"overview" | "transactions" | "streams">("overview");
  const [txFilter, setTxFilter] = useState<"all" | "credit" | "debit">("all");

  const currentMonth = MONTHLY_DATA[MONTHLY_DATA.length - 1];
  const prevMonth = MONTHLY_DATA[MONTHLY_DATA.length - 2];
  const revGrowth = ((currentMonth.receita - prevMonth.receita) / prevMonth.receita * 100).toFixed(1);
  const lucroGrowth = ((currentMonth.lucro - prevMonth.lucro) / prevMonth.lucro * 100).toFixed(1);
  const ytdRevenue = MONTHLY_DATA.reduce((a, m) => a + m.receita, 0);
  const ytdLucro = MONTHLY_DATA.reduce((a, m) => a + m.lucro, 0);
  const margin = ((currentMonth.lucro / currentMonth.receita) * 100).toFixed(0);

  const filteredTx = TRANSACTIONS.filter(t => txFilter === "all" || t.type === txFilter);

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F2", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft size={18} style={{ color: T.textSub }} /></button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: T.gold + "20" }}>
                <BarChart2 size={18} style={{ color: T.gold }} />
              </div>
              <div>
                <h1 className="font-black text-lg">Relatório de Receita</h1>
                <p className="text-xs" style={{ color: T.textSub }}>Financeiro detalhado DOOHPLAY</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="px-3 py-2 rounded-xl text-sm font-medium"
              style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
              {PERIODS.map(p => <option key={p}>{p}</option>)}
            </select>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: T.success + "20", color: T.success, border: `1px solid ${T.success}30` }}>
              <Download size={14} /> Exportar PDF
            </button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 pb-0 flex gap-1">
          {(["overview","transactions","streams"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2.5 text-sm font-bold border-b-2 transition-all"
              style={{ color: tab === t ? T.primary : T.textSub, borderColor: tab === t ? T.primary : "transparent" }}>
              {t === "overview" ? "Visão Geral" : t === "transactions" ? "Transações" : "Fontes"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Receita — Jul", value: `R$${currentMonth.receita.toLocaleString("pt-BR")}`, growth: revGrowth, color: T.success },
            { label: "Lucro líquido — Jul", value: `R$${currentMonth.lucro.toLocaleString("pt-BR")}`, growth: lucroGrowth, color: T.primary },
            { label: "Margem bruta", value: `${margin}%`, growth: "+2.1", color: T.accent },
            { label: "Receita anual (YTD)", value: `R$${ytdRevenue.toLocaleString("pt-BR")}`, growth: "+62.3", color: T.gold },
          ].map((k, i) => {
            const pos = Number(k.growth) >= 0;
            return (
              <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                <div className="text-xs mb-2" style={{ color: T.textSub }}>{k.label}</div>
                <div className="font-black text-2xl mb-1" style={{ color: k.color }}>{k.value}</div>
                <div className="flex items-center gap-1 text-xs font-bold" style={{ color: pos ? T.success : T.danger }}>
                  {pos ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {pos ? "+" : ""}{k.growth}% vs mês ant.
                </div>
              </div>
            );
          })}
        </div>

        {/* Overview tab */}
        {tab === "overview" && (
          <>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Receita vs Lucro — 2026</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={MONTHLY_DATA}>
                  <defs>
                    <linearGradient key="rr-receita" id="rr-receita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient key="rr-lucro" id="rr-lucro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={T.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`R$${v.toLocaleString("pt-BR")}`, name === "receita" ? "Receita" : "Lucro"]} />
                  <Area key="area-receita" type="monotone" dataKey="receita" stroke={T.primary} fill="url(#rr-receita)" strokeWidth={2} dot={false} />
                  <Area key="area-lucro" type="monotone" dataKey="lucro" stroke={T.success} fill="url(#rr-lucro)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Impressões mensais (mil)</h3>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={MONTHLY_DATA}>
                  <XAxis dataKey="month" tick={{ fill: T.textSub, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${(v / 1000).toFixed(0)}k`, "Impressões"]} />
                  <Bar key="bar-impressoes" dataKey="impressoes" fill={T.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Lucro YTD", value: `R$${ytdLucro.toLocaleString("pt-BR")}`, sub: "Janeiro–Julho 2026", color: T.success },
                { label: "CPM médio", value: "R$42,80", sub: "+8% vs último trimestre", color: T.primary },
                { label: "Fill Rate médio", value: "78%", sub: "Meta: 85%", color: T.warning },
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="text-xs mb-1" style={{ color: T.textSub }}>{m.label}</div>
                  <div className="font-black text-2xl" style={{ color: m.color }}>{m.value}</div>
                  <div className="text-xs mt-1" style={{ color: T.textSub }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Transactions tab */}
        {tab === "transactions" && (
          <>
            <div className="flex gap-2">
              {(["all","credit","debit"] as const).map(f => (
                <button key={f} onClick={() => setTxFilter(f)}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: txFilter === f ? (f === "credit" ? T.success : f === "debit" ? T.danger : T.primary) + "20" : T.card,
                    color: txFilter === f ? (f === "credit" ? T.success : f === "debit" ? T.danger : T.primary) : T.textSub,
                    border: `1px solid ${txFilter === f ? (f === "credit" ? T.success : f === "debit" ? T.danger : T.primary) + "40" : T.border}`,
                  }}>
                  {f === "all" ? "Todas" : f === "credit" ? "Entradas" : "Saídas"}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
              {filteredTx.map((tx, i) => (
                <div key={tx.id}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/2"
                  style={{ borderBottom: i < filteredTx.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: tx.type === "credit" ? T.success + "20" : T.danger + "20" }}>
                    {tx.type === "credit" ? <ArrowUpRight size={16} style={{ color: T.success }} /> : <ArrowDownRight size={16} style={{ color: T.danger }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{tx.description}</div>
                    <div className="text-xs" style={{ color: T.textSub }}>{tx.id} · {tx.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ background: tx.status === "paid" ? T.success + "20" : T.warning + "20", color: tx.status === "paid" ? T.success : T.warning }}>
                      {tx.status === "paid" ? "Pago" : "Pendente"}
                    </span>
                    <span className="font-black text-lg" style={{ color: tx.type === "credit" ? T.success : T.danger }}>
                      {tx.type === "credit" ? "+" : ""}R${Math.abs(tx.value).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Streams tab */}
        {tab === "streams" && (
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Fontes de receita</h3>
              <div className="flex items-center gap-4">
                <PieChart width={140} height={140}>
                  <Pie key="pie-value" data={REVENUE_STREAMS} cx={65} cy={65} innerRadius={44} outerRadius={65} dataKey="value" strokeWidth={0}>
                    {REVENUE_STREAMS.map((s, i) => <Cell key={i} fill={s.color} />)}
                  </Pie>
                </PieChart>
                <div className="flex-1 space-y-2">
                  {REVENUE_STREAMS.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                        <span className="text-sm">{s.name}</span>
                      </div>
                      <span className="font-bold text-sm" style={{ color: s.color }}>{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 rounded-2xl border" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Metas do mês</h3>
              <div className="space-y-4">
                {[
                  { label: "Receita bruta", current: 9400, target: 10000, color: T.primary },
                  { label: "Fill rate", current: 78, target: 85, color: T.accent, unit: "%" },
                  { label: "Novos anunciantes", current: 7, target: 10, color: T.success },
                  { label: "Impressões (k)", current: 398, target: 450, color: T.warning },
                ].map((g, i) => {
                  const pct = Math.min(100, (g.current / g.target) * 100);
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span style={{ color: T.textSub }}>{g.label}</span>
                        <span style={{ color: T.text }}>{g.current}{g.unit || ""} / {g.target}{g.unit || ""}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: T.panel }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: T.textSub }}>{pct.toFixed(0)}% da meta</div>
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
