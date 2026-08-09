import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, DollarSign, Users, Tv, BarChart2, Shield, Globe, Download, ChevronRight, Star, Target, Zap, Building2, PieChart as PieIcon, FileText, Lock, CheckCircle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#1A1D35",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82", warning: "#FFAA00",
  danger: "#FF4D6A", text: "#ECF0FF", textSub: "#4A5280", gold: "#FFD700",
};

const arrData = [
  { month: "Jan", arr: 0, screens: 0 },
  { month: "Fev", arr: 0, screens: 0 },
  { month: "Mar", arr: 0, screens: 0 },
  { month: "Abr", arr: 0, screens: 0 },
  { month: "Mai", arr: 0, screens: 0 },
  { month: "Jun", arr: 1164, screens: 1 },
  { month: "Jul", arr: 1164, screens: 1 },
  { month: "Ago", arr: 3480, screens: 3 },
  { month: "Set", arr: 8700, screens: 8 },
  { month: "Out", arr: 17400, screens: 15 },
  { month: "Nov", arr: 34800, screens: 28 },
  { month: "Dez", arr: 69600, screens: 52 },
];

const projData = [
  { year: "2026", arr: 70, screens: 52, label: "R$70k ARR" },
  { year: "2027 Q1", arr: 280, screens: 210, label: "Pre-seed" },
  { year: "2027 Q4", arr: 1200, screens: 900, label: "Seed" },
  { year: "2028 Q4", arr: 8400, screens: 6200, label: "Series A" },
  { year: "2030", arr: 85000, screens: 62000, label: "Unicórnio" },
];

const unitEcon = {
  ltv: { starter: 3492, pro: 10440, business: 22320 },
  cac: 180,
  payback: { starter: 1.9, pro: 0.6, business: 0.3 },
  margin: 72,
  nrr: 118,
  churn: 2.4,
};

const revenueStreams = [
  { name: "Assinatura B2C", pct: 68, value: 47040, color: T.primary },
  { name: "Receita de mídia", pct: 18, value: 12480, color: T.accent },
  { name: "Telas extras", pct: 8, value: 5520, color: T.success },
  { name: "Dados audiência", pct: 6, value: 4140, color: T.warning },
];

const competitiveMatrix = [
  { name: "DOOHPLAY", proof: 5, price: 5, ai: 5, mobile: 5, latam: 5, open: 3 },
  { name: "Broadsign", proof: 1, price: 1, ai: 2, mobile: 3, latam: 2, open: 5 },
  { name: "Vistar", proof: 1, price: 1, ai: 2, mobile: 2, latam: 1, open: 5 },
  { name: "ScreenCloud", proof: 1, price: 4, ai: 2, mobile: 4, latam: 2, open: 2 },
];

const exitScenarios = [
  { type: "Aquisição estratégica", acquirer: "JCDecaux / WPP / Outfront", timeline: "2028–2029", valuation: "R$150–400M", probability: "Alta", color: T.success },
  { type: "IPO Brasil (B3)", acquirer: "Oferta pública S.A.", timeline: "2030–2031", valuation: "R$800M–2B", probability: "Média", color: T.primary },
  { type: "IPO NYSE/NASDAQ", acquirer: "Mercado DOOH global", timeline: "2031+", valuation: "R$2–5B+", probability: "Alta se LATAM", color: T.gold },
];

const documents = [
  { name: "One-Pager Investidor", type: "PDF", size: "2.1 MB", status: "Pronto", color: T.success },
  { name: "Pitch Deck (15 slides)", type: "PDF", size: "8.4 MB", status: "Pronto", color: T.success },
  { name: "Modelo Financeiro 36m", type: "XLSX", size: "1.8 MB", status: "Pronto", color: T.success },
  { name: "Whitepaper ProofChain", type: "PDF", size: "3.2 MB", status: "Pronto", color: T.success },
  { name: "3× DPA (LGPD)", type: "DOCX", size: "0.9 MB", status: "Pronto", color: T.success },
  { name: "Relatório técnico Android", type: "PDF", size: "1.4 MB", status: "Pronto", color: T.success },
  { name: "Cap Table atual", type: "PDF", size: "0.3 MB", status: "Pendente", color: T.warning },
  { name: "Auditoria de segurança", type: "PDF", size: "—", status: "Pendente", color: T.warning },
  { name: "Due diligence jurídico", type: "PDF", size: "—", status: "Em andamento", color: T.primary },
];

interface Props { onBack: () => void; }

export default function InvestorDataRoom({ onBack }: Props) {
  const [tab, setTab] = useState<"metrics" | "economics" | "competitive" | "exit" | "documents">("metrics");
  const [liveArr, setLiveArr] = useState(1164);

  useEffect(() => {
    const iv = setInterval(() => setLiveArr(v => v + Math.floor(Math.random() * 4)), 3000);
    return () => clearInterval(iv);
  }, []);

  const TABS = [
    { id: "metrics", label: "ARR & Métricas", icon: TrendingUp },
    { id: "economics", label: "Unit Economics", icon: DollarSign },
    { id: "competitive", label: "Vantagem Competitiva", icon: Target },
    { id: "exit", label: "Tese de Saída", icon: Star },
    { id: "documents", label: "Data Room", icon: FileText },
  ] as const;

  return (
    <div className="min-h-screen" style={{ background: T.bg, color: T.text, fontFamily: "'Inter', sans-serif" }}>
      <div className="sticky top-0 z-40 border-b" style={{ background: T.panel + "F0", borderColor: T.border, backdropFilter: "blur(16px)" }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm hover:text-white transition-colors" style={{ color: T.textSub }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-2 font-bold">
            <Star size={16} style={{ color: T.gold }} /> Investor Data Room
          </div>
          <div className="text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5" style={{ borderColor: T.border, color: T.textSub }}>
            <Lock size={12} /> Confidencial — NDA
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "ARR atual", value: `R$${liveArr.toLocaleString("pt-BR")}`, sub: "1 cliente · crescendo", color: T.success, icon: TrendingUp },
            { label: "NRR projetado", value: `${unitEcon.nrr}%`, sub: "net revenue retention", color: T.primary, icon: BarChart2 },
            { label: "Margem bruta", value: `${unitEcon.margin}%`, sub: "excl. hardware cliente", color: T.accent, icon: PieIcon },
            { label: "Churn mensal", value: `${unitEcon.churn}%`, sub: "projetado ano 1", color: T.warning, icon: Tv },
          ].map((m, i) => {
            const Icon = m.icon;
            return (
              <div key={i} className="rounded-2xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs" style={{ color: T.textSub }}>{m.label}</span>
                  <Icon size={14} style={{ color: m.color }} />
                </div>
                <div className="text-2xl font-black mb-0.5" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs" style={{ color: T.textSub }}>{m.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={{ background: tab === t.id ? T.primary : T.card, color: tab === t.id ? "#fff" : T.textSub, border: `1px solid ${tab === t.id ? T.primary : T.border}` }}>
                <Icon size={14} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* ARR & Metrics */}
        {tab === "metrics" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-1">ARR 2026 — trajetória real</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Receita anual recorrente acumulada (BRL)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={arrData}>
                    <defs>
                      <linearGradient id="idr-arr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.success} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`R$${v.toLocaleString("pt-BR")}`, "ARR"]} />
                    <Area type="monotone" dataKey="arr" stroke={T.success} fill="url(#idr-arr)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-1">Projeção ARR 2026–2030</h3>
                <p className="text-xs mb-4" style={{ color: T.textSub }}>Modelo base conservador (R$ mil)</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={projData}>
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}k`} />
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`R$${v}k`, "ARR"]} />
                    <Bar dataKey="arr" fill={T.primary} radius={[4, 4, 0, 0]}>
                      {projData.map((_, i) => <Cell key={`idr-cell-${i}`} fill={i === projData.length - 1 ? T.gold : T.primary} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">Composição de receita (projeção 2027)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={revenueStreams} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="pct" paddingAngle={3}>
                      {revenueStreams.map((s, i) => <Cell key={`idr-pie-${i}`} fill={s.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {revenueStreams.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <div className="flex-1 text-sm">{s.name}</div>
                      <div className="font-bold text-sm" style={{ color: s.color }}>{s.pct}%</div>
                    </div>
                  ))}
                  <div className="pt-2 border-t text-sm" style={{ borderColor: T.border, color: T.textSub }}>
                    Total projetado 2027: <span className="font-bold" style={{ color: T.text }}>R$69k ARR</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {projData.slice(1).map((p, i) => (
                <div key={i} className="rounded-xl border p-5" style={{ background: T.card, borderColor: T.border }}>
                  <div className="text-xs mb-2 font-semibold" style={{ color: i === projData.length - 2 ? T.gold : T.textSub }}>{p.label}</div>
                  <div className="text-2xl font-black mb-1" style={{ color: i === projData.length - 2 ? T.gold : T.text }}>R${p.arr >= 1000 ? `${(p.arr/1000).toFixed(1)}M` : `${p.arr}k`}</div>
                  <div className="text-sm" style={{ color: T.textSub }}>{p.screens.toLocaleString("pt-BR")} telas · {p.year}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unit Economics */}
        {tab === "economics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { plan: "Starter", price: 97, ltv: unitEcon.ltv.starter, payback: unitEcon.payback.starter, color: T.success },
                { plan: "Pro", price: 290, ltv: unitEcon.ltv.pro, payback: unitEcon.payback.pro, color: T.primary },
                { plan: "Business", price: 620, ltv: unitEcon.ltv.business, payback: unitEcon.payback.business, color: T.gold },
              ].map((p, i) => (
                <div key={i} className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                  <div className="font-bold text-lg mb-4" style={{ color: p.color }}>{p.plan}</div>
                  <div className="space-y-4">
                    {[
                      { label: "MRR por cliente", value: `R$${p.price}` },
                      { label: "LTV (36 meses)", value: `R$${p.ltv.toLocaleString("pt-BR")}` },
                      { label: "CAC estimado", value: `R$${unitEcon.cac}` },
                      { label: "LTV/CAC ratio", value: `${(p.ltv / unitEcon.cac).toFixed(1)}×` },
                      { label: "Payback period", value: `${p.payback} meses` },
                    ].map((row, j) => (
                      <div key={j} className="flex justify-between text-sm border-b pb-2" style={{ borderColor: T.border }}>
                        <span style={{ color: T.textSub }}>{row.label}</span>
                        <span className="font-semibold" style={{ color: j >= 3 ? p.color : T.text }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 rounded-xl text-center text-xs font-bold" style={{ background: p.color + "15", color: p.color }}>
                    LTV/CAC {(p.ltv / unitEcon.cac).toFixed(1)}× — {(p.ltv / unitEcon.cac) > 10 ? "Excelente" : "Saudável"} para SaaS
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-4">Estrutura de custos (por tela/mês)</h3>
                <div className="space-y-3">
                  {[
                    { item: "Supabase / infra cloud", cost: 4.20, pct: 12 },
                    { item: "IA generativa (cota)", cost: 2.80, pct: 8 },
                    { item: "Polygon (ProofChain)", cost: 0.15, pct: 0.4 },
                    { item: "TSA (timestamp)", cost: 0.08, pct: 0.2 },
                    { item: "Suporte / atendimento", cost: 3.50, pct: 10 },
                    { item: "Margem bruta restante", cost: 21.27, pct: 61, highlight: true },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-24 text-right font-mono text-xs" style={{ color: row.highlight ? T.success : T.textSub }}>
                        R${row.cost.toFixed(2)}
                      </div>
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: T.border }}>
                        <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.highlight ? T.success : T.primary + "80" }} />
                      </div>
                      <div className="w-32 text-xs" style={{ color: row.highlight ? T.success : T.textSub }}>{row.item}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs" style={{ color: T.textSub }}>* Baseado em plano Pro (R$35/tela equivalente)</div>
              </div>

              <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                <h3 className="font-bold mb-4">Benchmarks SaaS (referência)</h3>
                <div className="space-y-3">
                  {[
                    { metric: "LTV/CAC ratio", doohplay: "19–58×", benchmark: "> 3× = saudável", status: "exceptional" },
                    { metric: "Payback period", doohplay: "0,3–1,9 meses", benchmark: "< 18 meses = bom", status: "exceptional" },
                    { metric: "Margem bruta", doohplay: "72%", benchmark: "> 60% = SaaS tier", status: "good" },
                    { metric: "NRR projetado", doohplay: "118%", benchmark: "> 110% = expansão", status: "good" },
                    { metric: "Churn mensal", doohplay: "2,4%", benchmark: "< 5% = saudável", status: "good" },
                  ].map((row, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border text-sm" style={{ background: T.panel, borderColor: T.border }}>
                      <CheckCircle size={14} style={{ color: row.status === "exceptional" ? T.gold : T.success }} className="flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-xs">{row.metric}</div>
                        <div className="text-xs" style={{ color: T.textSub }}>{row.benchmark}</div>
                      </div>
                      <div className="font-bold text-xs" style={{ color: row.status === "exceptional" ? T.gold : T.success }}>{row.doohplay}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Competitive */}
        {tab === "competitive" && (
          <div className="space-y-6">
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: T.border }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: T.panel }}>
                    {["Empresa", "Prova criptog.", "Preço acessível", "IA generativa", "App Android", "Mercado LATAM", "OpenRTB"].map((h, i) => (
                      <th key={i} className="text-center p-4 font-medium text-xs" style={{ color: T.textSub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {competitiveMatrix.map((co, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: T.border, background: i === 0 ? T.primary + "08" : T.card }}>
                      <td className="p-4 font-bold text-sm">
                        {i === 0 ? <span style={{ color: T.primary }}>★ {co.name}</span> : co.name}
                      </td>
                      {[co.proof, co.price, co.ai, co.mobile, co.latam, co.open].map((score, j) => (
                        <td key={j} className="text-center p-3">
                          <div className="flex items-center justify-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, k) => (
                              <div key={k} className="w-2 h-2 rounded-full" style={{ background: k < score ? (i === 0 ? T.success : T.textSub + "80") : T.border }} />
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Diferencial técnico inegável",
                  color: T.success,
                  items: ["Único com ProofChain de 4 camadas no mercado DOOH", "IA generativa integrada ao player (nenhum concorrente tem)", "App Android nativo testado em hardware físico", "Base jurídica LGPD + ICP-Brasil pronta para enterprise"],
                },
                {
                  title: "Gaps a fechar até 2027",
                  color: T.warning,
                  items: ["OpenRTB 2.x para conectar com DSPs globais", "SSP ou parceria com Broadsign Ads / Vistar", "Time comercial focado em agências de mídia", "Cobertura LATAM: México e Colombia em 2027"],
                },
              ].map((section, i) => (
                <div key={i} className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
                  <h3 className="font-bold mb-4" style={{ color: section.color }}>{section.title}</h3>
                  <div className="space-y-3">
                    {section.items.map((item, j) => (
                      <div key={j} className="flex items-start gap-3 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: section.color }} />
                        <span style={{ color: T.textSub }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exit scenarios */}
        {tab === "exit" && (
          <div className="space-y-6">
            <p className="text-sm" style={{ color: T.textSub }}>Três caminhos para liquidez, ordenados por probabilidade e velocidade de execução.</p>
            <div className="space-y-4">
              {exitScenarios.map((s, i) => (
                <div key={i} className="rounded-2xl border p-6" style={{ background: T.card, borderColor: s.color + "30" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: s.color + "20", color: s.color }}>
                          {i === 0 ? "MAIS PROVÁVEL" : i === 1 ? "AMBIÇÃO INTERMEDIÁRIA" : "VISÃO UNICÓRNIO"}
                        </span>
                        <span className="text-xs" style={{ color: T.textSub }}>{s.timeline}</span>
                      </div>
                      <h3 className="text-xl font-bold mb-1">{s.type}</h3>
                      <p className="text-sm" style={{ color: T.textSub }}>{s.acquirer}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black" style={{ color: s.color }}>{s.valuation}</div>
                      <div className="text-xs mt-1" style={{ color: T.textSub }}>Probabilidade: <span style={{ color: s.color }}>{s.probability}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border p-6" style={{ background: T.card, borderColor: T.border }}>
              <h3 className="font-bold mb-4">O que precisa ser verdade para cada saída</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {[
                  { title: "Aquisição 2028", reqs: ["200+ telas ativas", "ARR > R$1M", "ProofChain diferenciado", "Base jurídica limpa"], color: T.success },
                  { title: "IPO B3 2030", reqs: ["2.000+ telas ativas", "ARR > R$8M", "Presença em 3+ estados", "Auditoria Big 4"], color: T.primary },
                  { title: "IPO NYSE 2031+", reqs: ["50k+ telas LATAM", "ARR > R$50M", "OpenRTB / DSP live", "Time C-level completo"], color: T.gold },
                ].map((col, i) => (
                  <div key={i} className="rounded-xl border p-4" style={{ background: T.panel, borderColor: T.border }}>
                    <div className="font-semibold mb-3" style={{ color: col.color }}>{col.title}</div>
                    {col.reqs.map((r, j) => (
                      <div key={j} className="flex items-center gap-2 mb-2">
                        <ChevronRight size={12} style={{ color: col.color }} />
                        <span style={{ color: T.textSub }}>{r}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Room documents */}
        {tab === "documents" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-xl mb-1">Data Room completo</h2>
                <p className="text-sm" style={{ color: T.textSub }}>Documentos para due diligence de investidores</p>
              </div>
              <div className="text-xs px-3 py-1.5 rounded-full border" style={{ borderColor: T.border, color: T.textSub }}>
                {documents.filter(d => d.status === "Pronto").length}/{documents.length} documentos prontos
              </div>
            </div>
            <div className="space-y-3">
              {documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border" style={{ background: T.card, borderColor: T.border }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center font-mono text-xs flex-shrink-0"
                    style={{ background: T.panel, color: doc.color }}>{doc.type}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{doc.name}</div>
                    {doc.size !== "—" && <div className="text-xs" style={{ color: T.textSub }}>{doc.size}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: doc.color + "20", color: doc.color }}>{doc.status}</span>
                    {doc.status === "Pronto" && (
                      <button className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ background: T.panel }}>
                        <Download size={14} style={{ color: T.textSub }} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
