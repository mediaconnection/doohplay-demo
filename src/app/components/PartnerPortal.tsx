import { useState } from "react";
import {
  ArrowLeft, TrendingUp, DollarSign, Users, Star, Award, ChevronRight,
  Download, Share2, Copy, CheckCircle2, Target, Zap, Globe, BarChart2,
  Package, ArrowUpRight, Clock, Shield, BookOpen, Video, FileText,
  Gift, ChevronDown, Search, Filter
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar
} from "recharts";

const T = {
  bg: "#05060E", panel: "#0A0C18", card: "#0F1120", border: "#181C30",
  primary: "#4F6EF7", accent: "#7C5CFC", success: "#00DC82",
  warning: "#FFAA00", danger: "#FF4D6A", cyan: "#06C8FF",
  purple: "#9B6DFF", pink: "#FF3EA5",
  text: "#ECF0FF", textSub: "#4A5280",
};

const commissionData = [
  { mes:"Jan", comissao:2840, clientes:3 }, { mes:"Fev", comissao:3120, clientes:4 },
  { mes:"Mar", comissao:2980, clientes:3 }, { mes:"Abr", comissao:4200, clientes:5 },
  { mes:"Mai", comissao:3860, clientes:5 }, { mes:"Jun", comissao:5140, clientes:7 },
  { mes:"Jul", comissao:4920, clientes:6 }, { mes:"Ago", comissao:6280, clientes:8 },
  { mes:"Set", comissao:5840, clientes:7 }, { mes:"Out", comissao:7120, clientes:9 },
  { mes:"Nov", comissao:8340, clientes:11 }, { mes:"Dez", comissao:9600, clientes:13 },
];

const clients = [
  { name:"Restaurante Bom Sabor", plan:"Enterprise", tvs:8, mrr:1240, status:"Ativo", since:"Jan 2025", commission:186 },
  { name:"Academia FitLife",      plan:"Business",  tvs:4, mrr:480,  status:"Ativo", since:"Mar 2025", commission:72 },
  { name:"Shopping Paulista",     plan:"Enterprise", tvs:24, mrr:3600, status:"Ativo", since:"Nov 2024", commission:540 },
  { name:"Clínica Saúde+",        plan:"Starter",   tvs:2, mrr:180,  status:"Trial", since:"Jul 2025", commission:0 },
  { name:"Hotel Grand Palace",    plan:"Business",  tvs:12, mrr:1440, status:"Ativo", since:"Fev 2025", commission:216 },
  { name:"FATEC Campinas",        plan:"Business",  tvs:6, mrr:720,  status:"Ativo", since:"Abr 2025", commission:108 },
];

const materials = [
  { type:"PDF",   label:"Apresentação Comercial",       size:"2.4 MB", cat:"Vendas",     downloads:847 },
  { type:"PPT",   label:"Pitch Deck Investidores",      size:"5.1 MB", cat:"Vendas",     downloads:423 },
  { type:"PDF",   label:"Proposta de Parceria",         size:"1.2 MB", cat:"Contratos",  downloads:312 },
  { type:"Video", label:"Demo DOOHPLAY 3min",           size:"48 MB",  cat:"Marketing",  downloads:1204 },
  { type:"ZIP",   label:"Logo Kit & Brand Assets",      size:"8.7 MB", cat:"Marca",      downloads:659 },
  { type:"PDF",   label:"Guia de Onboarding Clientes",  size:"3.8 MB", cat:"Suporte",    downloads:294 },
  { type:"Video", label:"Webinar: Como vender DOOH",    size:"210 MB", cat:"Treinamento",downloads:178 },
  { type:"PDF",   label:"Calculadora de ROI",           size:"0.9 MB", cat:"Vendas",     downloads:731 },
];

const ranking = [
  { rank:1,  name:"Agência MediaPro",    city:"São Paulo",  clients:34, mrr:"R$48.200", badge:"Platinum" },
  { rank:2,  name:"Digital Signs SP",   city:"São Paulo",  clients:27, mrr:"R$38.640", badge:"Gold" },
  { rank:3,  name:"AdSolutions BR",     city:"Rio",        clients:21, mrr:"R$30.100", badge:"Gold" },
  { rank:4,  name:"ScreenMedia RS",     city:"Porto Alegre",clients:18, mrr:"R$25.800", badge:"Silver" },
  { rank:5,  name:"Você",               city:"São Paulo",  clients:13, mrr:"R$18.620", badge:"Silver", isMe:true },
];

const badgeColors: Record<string,string> = { Platinum:"#06C8FF", Gold:"#FFAA00", Silver:"#94A3B8" };

const TABS = ["Visão Geral","Clientes","Materiais","Ranking","Simulador"];

export default function PartnerPortal({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState("Visão Geral");
  const [simTvs, setSimTvs] = useState(10);
  const [simPlan, setSimPlan] = useState("Business");
  const [copied, setCopied] = useState(false);

  const refCode = "PARTNER-M7X9K2";
  const totalCommission = clients.reduce((s, c) => s + c.commission, 0);
  const totalMrr = clients.filter(c => c.status === "Ativo").reduce((s, c) => s + c.mrr, 0);
  const simMonthly = Math.round(simTvs * (simPlan === "Enterprise" ? 150 : simPlan === "Business" ? 120 : 90) * 0.15);

  const handleCopy = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="h-screen flex flex-col" style={{ background: T.bg, color: T.text, fontFamily: "'Inter',sans-serif" }}>
      <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0" style={{ background: T.panel, borderColor: T.border }}>
        <button onClick={onBack} className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: T.textSub }}>
          <ArrowLeft size={14} /> Voltar
        </button>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg,${T.primary},${T.accent})` }}>
            <Star size={13} color="#fff" />
          </div>
          <span className="font-bold text-sm">Partner Portal</span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-black" style={{ background: `${T.warning}20`, color: T.warning }}>Silver Partner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs px-3 py-1.5 rounded-lg border font-mono" style={{ border: `1px solid ${T.border}`, color: T.textSub }}>{refCode}</div>
          <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
            style={{ border: `1px solid ${copied ? T.success : T.border}`, color: copied ? T.success : T.textSub }}>
            {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
            {copied ? "Copiado!" : "Copiar link"}
          </button>
        </div>
      </div>

      <div className="flex gap-0 border-b flex-shrink-0" style={{ background: T.panel, borderColor: T.border }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors"
            style={{ color: tab === t ? T.primary : T.textSub, borderBottom: tab === t ? `2px solid ${T.primary}` : "2px solid transparent" }}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {tab === "Visão Geral" && (
          <div className="space-y-5">
            <div className="grid grid-cols-4 gap-4">
              {[
                { label:"Comissão este mês", value:"R$ 1.122", delta:"+18%", color:T.success, icon:DollarSign },
                { label:"MRR gerenciado",    value:"R$ 7.660",  delta:"+9%",  color:T.primary, icon:TrendingUp },
                { label:"Clientes ativos",   value:"5",         delta:"+2",   color:T.cyan,    icon:Users },
                { label:"Próximo nível",     value:"87 pts",    delta:"Gold em 13", color:T.warning, icon:Award },
              ].map(({ label, value, delta, color, icon: Icon }, i) => (
                <div key={i} className="p-5 rounded-2xl border" style={{ border: `1px solid ${color}20`, background: `${color}08` }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-bold" style={{ color: `${color}80` }}>{label}</span>
                  </div>
                  <div className="text-2xl font-black font-mono" style={{ color }}>{value}</div>
                  <div className="text-[10px] mt-1 font-mono" style={{ color: `${color}80` }}>{delta}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 p-5 rounded-2xl border" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm">Comissões 2025</h3>
                  <span className="text-[10px] font-mono" style={{ color: T.success }}>Total: R$ 64.240</span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={commissionData}>
                    <defs>
                      <linearGradient key="pp-grad" id="pp-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={T.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis key="pp-x" dataKey="mes" tick={{ fontSize: 10, fill: T.textSub }} axisLine={false} tickLine={false} />
                    <YAxis key="pp-y" hide />
                    <Tooltip key="pp-tt" formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Comissão"]} contentStyle={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text, fontSize: 11 }} />
                    <Area key="pp-area" type="monotone" dataKey="comissao" stroke={T.primary} strokeWidth={2.5} fill="url(#pp-grad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="p-5 rounded-2xl border space-y-4" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                <h3 className="font-bold text-sm">Progresso de Nível</h3>
                <div className="space-y-3">
                  {[{ label:"Starter", pts:0, color:"#64748B" }, { label:"Silver", pts:50, color:"#94A3B8" }, { label:"Gold", pts:100, color:T.warning }, { label:"Platinum", pts:200, color:T.cyan }].map(({ label, pts, color }, i) => {
                    const myPts = 87;
                    const done = myPts >= pts;
                    const active = label === "Silver";
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: done ? `${color}30` : T.border, border: `2px solid ${done ? color : T.border}` }}>
                          {done && <CheckCircle2 size={12} style={{ color }} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className={active ? "font-bold" : ""} style={{ color: done ? color : T.textSub }}>{label}</span>
                            <span className="font-mono" style={{ color: T.textSub }}>{pts} pts</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2 border-t" style={{ borderColor: T.border }}>
                  <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: T.textSub }}>Seus pontos</div>
                  <div className="text-2xl font-black font-mono" style={{ color: T.warning }}>87 / 100</div>
                  <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: T.border }}>
                    <div className="h-2 rounded-full" style={{ width: "87%", background: `linear-gradient(90deg,${T.warning},${T.success})` }} />
                  </div>
                  <div className="text-[9px] mt-1" style={{ color: T.textSub }}>Mais 13 pts para Gold 🏆</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "Clientes" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Seus Clientes ({clients.length})</h3>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: T.primary, color: "#fff" }}>
                <Users size={14} /> Adicionar cliente
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border" style={{ border: `1px solid ${T.border}` }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: T.border, background: T.card }}>
                    {["Cliente","Plano","TVs","MRR","Comissão","Status","Desde",""].map((h, i) => (
                      <th key={i} className="text-left px-4 py-3 text-[9px] font-black uppercase tracking-widest" style={{ color: T.textSub }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c, i) => (
                    <tr key={i} className="border-b hover:opacity-80 transition-opacity" style={{ borderColor: T.border, background: i % 2 === 0 ? T.bg : T.card }}>
                      <td className="px-4 py-3 font-semibold text-sm">{c.name}</td>
                      <td className="px-4 py-3"><span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: c.plan === "Enterprise" ? `${T.primary}20` : c.plan === "Business" ? `${T.accent}20` : `${T.success}20`, color: c.plan === "Enterprise" ? T.primary : c.plan === "Business" ? T.accent : T.success }}>{c.plan}</span></td>
                      <td className="px-4 py-3 font-mono text-sm">{c.tvs}</td>
                      <td className="px-4 py-3 font-mono text-sm font-bold" style={{ color: T.success }}>R$ {c.mrr.toLocaleString("pt-BR")}</td>
                      <td className="px-4 py-3 font-mono text-sm" style={{ color: c.commission > 0 ? T.warning : T.textSub }}>{c.commission > 0 ? `R$ ${c.commission}` : "—"}</td>
                      <td className="px-4 py-3"><span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: c.status === "Ativo" ? `${T.success}20` : `${T.warning}20`, color: c.status === "Ativo" ? T.success : T.warning }}>{c.status}</span></td>
                      <td className="px-4 py-3 text-xs" style={{ color: T.textSub }}>{c.since}</td>
                      <td className="px-4 py-3"><button className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ color: T.textSub }}><ChevronRight size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: T.card }}>
                    <td className="px-4 py-3 font-bold text-sm" colSpan={3}>Total</td>
                    <td className="px-4 py-3 font-mono font-black" style={{ color: T.success }}>R$ {totalMrr.toLocaleString("pt-BR")}</td>
                    <td className="px-4 py-3 font-mono font-black" style={{ color: T.warning }}>R$ {totalCommission}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {tab === "Materiais" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Materiais de Apoio</h3>
              <div className="flex items-center gap-1.5 px-3 h-8 rounded-xl border" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                <Search size={12} style={{ color: T.textSub }} />
                <input placeholder="Buscar..." className="bg-transparent text-xs outline-none" style={{ color: T.text }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {materials.map((m, i) => {
                const colorMap: Record<string,string> = { PDF: "#EF4444", PPT: "#F97316", Video: "#8B5CF6", ZIP: "#F59E0B" };
                const iconMap: Record<string,typeof FileText> = { PDF: FileText, PPT: BookOpen, Video: Video, ZIP: Package };
                const color = colorMap[m.type] ?? T.primary;
                const Icon = iconMap[m.type] ?? FileText;
                return (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border hover:opacity-90 transition-opacity" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20` }}><Icon size={18} style={{ color }} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{m.label}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${color}15`, color }}>{m.type}</span>
                        <span className="text-[9px]" style={{ color: T.textSub }}>{m.size}</span>
                        <span className="text-[9px]" style={{ color: T.textSub }}>· {m.downloads} downloads</span>
                      </div>
                    </div>
                    <button className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border hover:opacity-70 transition-opacity" style={{ border: `1px solid ${T.border}`, color: T.textSub }}><Download size={13} /></button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "Ranking" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold">Ranking de Parceiros · Julho 2025</h3>
              <div className="text-xs px-3 py-1.5 rounded-xl border" style={{ border: `1px solid ${T.border}`, color: T.textSub }}>Atualizado diariamente</div>
            </div>
            <div className="space-y-2">
              {ranking.map((p, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all"
                  style={{ border: `1.5px solid ${p.isMe ? T.primary : T.border}`, background: p.isMe ? `${T.primary}08` : T.card, boxShadow: p.isMe ? `0 0 0 3px ${T.primary}15` : "none" }}>
                  <div className="w-8 text-center font-black text-lg" style={{ color: p.rank <= 3 ? badgeColors[p.badge] : T.textSub }}>
                    {p.rank <= 3 ? ["🥇","🥈","🥉"][p.rank - 1] : p.rank}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: p.isMe ? T.primary : T.text }}>{p.name}</span>
                      {p.isMe && <span className="text-[8px] px-1.5 py-0.5 rounded-full font-black" style={{ background: `${T.primary}20`, color: T.primary }}>Você</span>}
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: `${badgeColors[p.badge]}20`, color: badgeColors[p.badge] }}>{p.badge}</span>
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: T.textSub }}>{p.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm font-mono" style={{ color: T.success }}>{p.mrr}</div>
                    <div className="text-[10px]" style={{ color: T.textSub }}>{p.clients} clientes</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Simulador" && (
          <div className="max-w-xl mx-auto">
            <h3 className="font-bold text-lg mb-1">Simulador de Comissão</h3>
            <p className="text-sm mb-6" style={{ color: T.textSub }}>Estime quanto você pode ganhar ao indicar novos clientes.</p>
            <div className="space-y-5">
              <div className="p-5 rounded-2xl border" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                <label className="text-xs font-bold uppercase tracking-widest block mb-3" style={{ color: T.textSub }}>Número de TVs do cliente</label>
                <input type="range" min={1} max={50} value={simTvs} onChange={e => setSimTvs(+e.target.value)} className="w-full h-2 rounded-full appearance-none cursor-pointer" style={{ accentColor: T.primary }} />
                <div className="flex justify-between text-xs mt-2 font-mono" style={{ color: T.textSub }}>
                  <span>1 TV</span><span className="font-bold text-base" style={{ color: T.primary }}>{simTvs} TVs</span><span>50 TVs</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl border" style={{ border: `1px solid ${T.border}`, background: T.card }}>
                <label className="text-xs font-bold uppercase tracking-widest block mb-3" style={{ color: T.textSub }}>Plano</label>
                <div className="flex gap-2">
                  {["Starter","Business","Enterprise"].map(p => (
                    <button key={p} onClick={() => setSimPlan(p)} className="flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all"
                      style={{ border: `1.5px solid ${simPlan === p ? T.primary : T.border}`, background: simPlan === p ? `${T.primary}18` : "transparent", color: simPlan === p ? T.primary : T.textSub }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-2xl border text-center" style={{ border: `1px solid ${T.success}30`, background: `${T.success}08` }}>
                <div className="text-xs uppercase tracking-widest mb-2" style={{ color: T.textSub }}>Sua comissão mensal estimada</div>
                <div className="text-5xl font-black font-mono mb-1" style={{ color: T.success }}>R$ {simMonthly.toLocaleString("pt-BR")}</div>
                <div className="text-sm mb-4" style={{ color: T.textSub }}>15% do MRR gerado pelo cliente</div>
                <div className="grid grid-cols-3 gap-3">
                  {[["Mensal", `R$ ${simMonthly.toLocaleString("pt-BR")}`],["Anual", `R$ ${(simMonthly*12).toLocaleString("pt-BR")}`],["Em 3 anos", `R$ ${(simMonthly*36).toLocaleString("pt-BR")}`]].map(([l,v],i)=>(
                    <div key={i} className="p-2.5 rounded-xl" style={{ background: `${T.success}10`, border: `1px solid ${T.success}20` }}>
                      <div className="text-[8px] uppercase" style={{ color: T.textSub }}>{l}</div>
                      <div className="text-sm font-black font-mono mt-0.5" style={{ color: T.success }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2" style={{ background: `linear-gradient(135deg,${T.primary},${T.accent})`, color: "#fff" }}>
                <Share2 size={16} /> Compartilhar proposta com cliente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
