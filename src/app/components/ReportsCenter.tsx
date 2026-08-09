import { useState } from "react";
import {
  ArrowLeft, FileText, Download, Calendar, Filter, Search,
  TrendingUp, DollarSign, Users, Shield, BarChart2, Eye,
  Clock, CheckCircle2, RefreshCw, Send, Star, ChevronRight,
  Printer, Share2, MoreHorizontal, Globe, Zap, Activity
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#181C30",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  warning: "#FFAA00", danger: "#FF4D6A", cyan: "#06C8FF",
  purple: "#9B6DFF", text: "#ECF0FF", textSub: "#4A5280",
};

const revenueData = [
  { mes:"Jan",receita:24800,impressoes:184000,fills:68 },
  { mes:"Fev",receita:28400,impressoes:210000,fills:70 },
  { mes:"Mar",receita:26100,impressoes:193000,fills:67 },
  { mes:"Abr",receita:31200,impressoes:231000,fills:72 },
  { mes:"Mai",receita:34800,impressoes:258000,fills:74 },
  { mes:"Jun",receita:32100,impressoes:238000,fills:71 },
  { mes:"Jul",receita:38400,impressoes:284800,fills:76 },
];

const audienceData = [
  { hora:"06h",pessoas:120 },{ hora:"08h",pessoas:380 },{ hora:"10h",pessoas:520 },
  { hora:"12h",pessoas:680 },{ hora:"14h",pessoas:490 },{ hora:"16h",pessoas:640 },
  { hora:"18h",pessoas:890 },{ hora:"20h",pessoas:720 },{ hora:"22h",pessoas:310 },
];

const segPie = [
  { name:"18–24",value:18,color:"#4F6EF7" }, { name:"25–34",value:32,color:"#7C5CFC" },
  { name:"35–44",value:26,color:"#06C8FF" }, { name:"45–54",value:14,color:"#00DC82" },
  { name:"55+",  value:10,color:"#FFAA00" },
];

const proofData = [
  { dia:"Seg",proofs:1847 },{ dia:"Ter",proofs:2134 },{ dia:"Qua",proofs:1923 },
  { dia:"Qui",proofs:2341 },{ dia:"Sex",proofs:2789 },{ dia:"Sáb",proofs:1456 },{ dia:"Dom",proofs:987 },
];

const REPORT_TYPES = [
  { id:"performance",label:"Performance de Campanha",  icon:TrendingUp,  color:T.primary,  desc:"Impressões, CPM, fill rate, tempo de exibição",        lastGen:"22/07/2025 · 08:00", size:"2.4 MB" },
  { id:"financial",  label:"Relatório Financeiro",     icon:DollarSign,  color:T.success,  desc:"Receita, comissões, RPM por TV, projeções",             lastGen:"22/07/2025 · 08:00", size:"1.8 MB" },
  { id:"audience",   label:"Análise de Audiência",     icon:Users,       color:T.cyan,     desc:"Perfil demográfico, horários de pico, heatmap",          lastGen:"21/07/2025 · 23:00", size:"3.1 MB" },
  { id:"blockchain", label:"Auditoria Blockchain",     icon:Shield,      color:"#9B6DFF",  desc:"Proof-of-play, hashes verificados, timeline imutável",   lastGen:"22/07/2025 · 00:00", size:"4.7 MB" },
  { id:"advertiser", label:"Relatório de Anunciantes", icon:BarChart2,   color:T.warning,  desc:"Clientes, campanhas, ROI por cliente, remarketing",      lastGen:"21/07/2025 · 18:00", size:"2.2 MB" },
  { id:"network",    label:"Status da Rede",           icon:Globe,       color:T.accent,   desc:"Uptime por TV, erros, manutenções, cobertura geográfica", lastGen:"22/07/2025 · 09:00", size:"1.5 MB" },
];

const SCHEDULE_REPORTS = [
  { label:"Performance Semanal",   freq:"Toda segunda · 08:00", dest:"gestor@empresa.com", active:true },
  { label:"Financeiro Mensal",     freq:"Dia 1 · 07:00",        dest:"cfo@empresa.com",    active:true },
  { label:"Auditoria Blockchain",  freq:"Diário · 00:00",       dest:"compliance@empresa.com", active:true },
  { label:"Status da Rede",        freq:"Diário · 09:00",       dest:"ti@empresa.com",     active:false },
];

import { Target } from "lucide-react";

const TABS = ["Visão Geral","Relatórios","Agendados","Auditoria"];

export default function ReportsCenter({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState("Visão Geral");
  const [period, setPeriod] = useState("Jul 2025");
  const [selReport, setSelReport] = useState<string|null>(null);
  const [generating, setGenerating] = useState<string|null>(null);

  const handleGenerate = (id: string) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 2200);
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter',sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0" style={{ background: T.panel, borderColor: T.border }}>
        <button onClick={onBack} className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: T.textSub }}>
          <ArrowLeft size={14} /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg,${T.primary},${T.accent})` }}>
            <BarChart2 size={13} color="#fff" />
          </div>
          <span className="font-bold text-sm">Central de Relatórios</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="text-xs px-3 py-1.5 rounded-lg border outline-none" style={{ background: T.card, border: `1px solid ${T.border}`, color: T.text }}>
            {["Jul 2025","Jun 2025","Mai 2025","Abr 2025","Mar 2025","Q2 2025","Q1 2025","2025"].map(p => <option key={p}>{p}</option>)}
          </select>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ border: `1px solid ${T.border}`, color: T.textSub }}>
            <RefreshCw size={12} /> Atualizar
          </button>
        </div>
      </div>

      <div className="flex border-b flex-shrink-0" style={{ background: T.panel, borderColor: T.border }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors"
            style={{ color: tab === t ? T.primary : T.textSub, borderBottom: tab === t ? `2px solid ${T.primary}` : "2px solid transparent" }}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">

        {/* VISÃO GERAL */}
        {tab === "Visão Geral" && (
          <div className="space-y-5">
            {/* KPIs */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label:"Receita · Jul",       value:"R$ 38.400",  delta:"+19,6%",  color:T.success },
                { label:"Impressões · Jul",    value:"284.800",    delta:"+19,5%",  color:T.primary },
                { label:"CPM médio",           value:"R$ 18,40",   delta:"Estável", color:T.warning },
                { label:"Proofs gerados · Jul",value:"12.847",     delta:"+8,3%",   color:"#9B6DFF" },
              ].map(({ label, value, delta, color }, i) => (
                <div key={i} className="p-5 rounded-2xl border" style={{ border: `1px solid ${color}20`, background: `${color}08` }}>
                  <div className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: `${color}80` }}>{label}</div>
                  <div className="text-2xl font-black font-mono" style={{ color }}>{value}</div>
                  <div className="text-[10px] mt-1 font-mono" style={{ color: `${color}80` }}>{delta} vs mês anterior</div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-3 gap-4">
              {/* Revenue trend */}
              <div className="col-span-2 p-5 rounded-2xl border" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm">Receita & Impressões · 2025</h3>
                  <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: `${T.success}20`, color: T.success }}>↑ +54,8% YTD</span>
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient key="rc-rev" id="rc-rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.success} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={T.success} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient key="rc-imp" id="rc-imp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.primary} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis key="rc-x" dataKey="mes" tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} />
                    <YAxis key="rc-y" hide />
                    <Tooltip key="rc-tt" contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text, fontSize: 11 }} />
                    <Area key="rc-a1" type="monotone" dataKey="receita" stroke={T.success} strokeWidth={2} fill="url(#rc-rev)" dot={false} name="Receita (R$)" />
                    <Area key="rc-a2" type="monotone" dataKey="impressoes" stroke={T.primary} strokeWidth={2} fill="url(#rc-imp)" dot={false} name="Impressões" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Audience pie */}
              <div className="p-5 rounded-2xl border" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                <h3 className="font-bold text-sm mb-4">Audiência por Faixa</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <PieChart>
                    <Pie key="rc-pie" data={segPie} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                      {segPie.map((entry, i) => <Cell key={`rc-cell-${i}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip key="rc-pie-tt" formatter={(v: number) => [`${v}%`, ""]} contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1 mt-2">
                  {segPie.map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: s.color }}/><span style={{ color: T.textSub }}>{s.name}</span></div>
                      <span className="font-mono font-bold" style={{ color: s.color }}>{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Audience heatmap + proofs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                <h3 className="font-bold text-sm mb-4">Audiência por Hora</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={audienceData}>
                    <XAxis key="rc-ah-x" dataKey="hora" tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} />
                    <YAxis key="rc-ah-y" hide />
                    <Tooltip key="rc-ah-tt" contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 10 }} />
                    <Bar key="rc-ah-bar" dataKey="pessoas" fill={T.cyan} radius={[4, 4, 0, 0]} name="Pessoas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="p-5 rounded-2xl border" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                <h3 className="font-bold text-sm mb-4">Proofs-of-Play por Dia</h3>
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={proofData}>
                    <XAxis key="rc-pf-x" dataKey="dia" tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} />
                    <YAxis key="rc-pf-y" hide />
                    <Tooltip key="rc-pf-tt" contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 10 }} />
                    <Bar key="rc-pf-bar" dataKey="proofs" fill="#9B6DFF" radius={[4, 4, 0, 0]} name="Proofs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* RELATÓRIOS */}
        {tab === "Relatórios" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold">Relatórios Disponíveis</h3>
              <div className="flex items-center gap-2 text-xs" style={{ color: T.textSub }}>
                <Clock size={12} /> Última atualização: hoje às 09:00
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {REPORT_TYPES.map(r => {
                const Icon = r.icon;
                const isGen = generating === r.id;
                return (
                  <div key={r.id} className="p-5 rounded-2xl border transition-all hover:opacity-95"
                    style={{ border: `1.5px solid ${selReport === r.id ? r.color : T.border}`, background: T.card, boxShadow: selReport === r.id ? `0 0 0 3px ${r.color}15` : "none" }}
                    onClick={() => setSelReport(r.id === selReport ? null : r.id)}>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${r.color}20` }}>
                        <Icon size={18} style={{ color: r.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm">{r.label}</div>
                        <div className="text-[10px] mt-0.5 leading-relaxed" style={{ color: T.textSub }}>{r.desc}</div>
                        <div className="flex items-center gap-3 mt-2 text-[9px]" style={{ color: T.textSub }}>
                          <span>Gerado: {r.lastGen}</span>
                          <span>{r.size}</span>
                        </div>
                      </div>
                    </div>
                    {selReport === r.id && (
                      <div className="mt-4 pt-4 border-t flex gap-2" style={{ borderColor: T.border }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleGenerate(r.id)} disabled={isGen}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all"
                          style={{ background: isGen ? `${r.color}30` : `linear-gradient(135deg,${T.primary},${T.accent})`, color: "#fff" }}>
                          {isGen ? <><RefreshCw size={12} className="animate-spin" /> Gerando...</> : <><Eye size={12} /> Gerar Preview</>}
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border hover:opacity-80 transition-opacity"
                          style={{ border: `1px solid ${T.border}`, color: T.textSub }}>
                          <Download size={12} /> PDF
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border hover:opacity-80 transition-opacity"
                          style={{ border: `1px solid ${T.border}`, color: T.textSub }}>
                          <Share2 size={12} /> Enviar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* AGENDADOS */}
        {tab === "Agendados" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold">Relatórios Agendados</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: T.primary, color: "#fff" }}>
                <Calendar size={14} /> Novo agendamento
              </button>
            </div>
            <div className="space-y-3">
              {SCHEDULE_REPORTS.map((s, i) => (
                <div key={i} className="flex items-center gap-5 px-5 py-4 rounded-2xl border" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${T.primary}15` }}>
                    <Send size={16} style={{ color: T.primary }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{s.label}</div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px]" style={{ color: T.textSub }}>
                      <span className="flex items-center gap-1"><Clock size={10} /> {s.freq}</span>
                      <span>→ {s.dest}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: s.active ? `${T.success}20` : `${T.textSub}20`, color: s.active ? T.success : T.textSub }}>
                      {s.active ? "Ativo" : "Pausado"}
                    </span>
                    <button className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ color: T.textSub }}>
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-5 rounded-2xl border" style={{ border: `1px solid ${T.border}`, background: T.card }}>
              <h4 className="font-bold text-sm mb-3">Configurações de Entrega</h4>
              <div className="grid grid-cols-2 gap-4">
                {[["Formato padrão","PDF + Excel"],["Idioma","Português (BR)"],["Fuso horário","America/São_Paulo"],["Compressão","ZIP automático para >5MB"]].map(([l,v],i)=>(
                  <div key={i} className="flex justify-between items-center text-sm py-2 border-b" style={{ borderColor: T.border }}>
                    <span style={{ color: T.textSub }}>{l}</span>
                    <span className="font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AUDITORIA */}
        {tab === "Auditoria" && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label:"Proofs este mês", value:"12.847", color:"#9B6DFF", icon:Shield },
                { label:"Taxa de verificação", value:"99,97%", color:T.success, icon:CheckCircle2 },
                { label:"Rede Blockchain", value:"Polygon", color:T.cyan, icon:Zap },
              ].map(({ label, value, color, icon: Icon }, i) => (
                <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border" style={{ border: `1px solid ${color}20`, background: `${color}08` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-widest font-bold" style={{ color: `${color}80` }}>{label}</div>
                    <div className="text-xl font-black font-mono mt-0.5" style={{ color }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl overflow-hidden border" style={{ border: `1px solid ${T.border}` }}>
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: T.border, background: T.card }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: T.success, boxShadow: `0 0 6px ${T.success}` }} />
                  <span className="font-bold text-sm">Proof-of-Play · Registros Recentes</span>
                </div>
                <button className="text-xs border px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ border: `1px solid ${T.border}`, color: T.textSub }}>
                  <Download size={11} /> Exportar CSV
                </button>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ background: T.bg }}>
                    {["Hash","TV","Template","Horário","Duração","Receita","Status"].map((h, i) => (
                      <th key={i} className="text-left px-4 py-2.5 text-[9px] font-black uppercase tracking-widest" style={{ color: T.textSub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, i) => {
                    const hashes = ["0x847a3f...d291","0xf219b8...aa47","0x3c8e12...b891","0xa74f91...2c34","0x1d8b45...ef78","0x9c2f67...0a12","0x5e3d89...cd56","0x72a1c3...9b01"];
                    const tvs = ["Shopping Paulista","Restaurante Central","Lobby Corp","Academia FitLife","Hotel Grand","FATEC Campinas","Aeroporto GRU","Clínica Vita"];
                    const templates = ["Menu do Dia","Promoção Flash","Samsung Campaign","Grade de Aulas","KPIs Tempo Real","Contagem Regressiva","Happy Hour","Cardápio Premium"];
                    return (
                      <tr key={i} className="border-b hover:opacity-80 transition-opacity" style={{ borderColor: T.border, background: i % 2 === 0 ? T.bg : T.card }}>
                        <td className="px-4 py-2.5 font-mono text-xs" style={{ color: "#9B6DFF" }}>{hashes[i]}</td>
                        <td className="px-4 py-2.5 text-xs">{tvs[i]}</td>
                        <td className="px-4 py-2.5 text-xs" style={{ color: T.textSub }}>{templates[i]}</td>
                        <td className="px-4 py-2.5 text-xs font-mono" style={{ color: T.textSub }}>{`07:${(i * 7 + 12).toString().padStart(2,"0")}:${(i * 3 + 5).toString().padStart(2,"0")}`}</td>
                        <td className="px-4 py-2.5 text-xs font-mono" style={{ color: T.textSub }}>{[15,10,20,25,12,18,15,10][i]}s</td>
                        <td className="px-4 py-2.5 text-xs font-mono" style={{ color: T.success }}>R$ {[0.034,0.022,0.051,0,0.028,0.041,0.019,0.031][i].toFixed(3)}</td>
                        <td className="px-4 py-2.5">
                          <span className="text-[8px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${T.success}20`, color: T.success }}>✓ Verificado</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
